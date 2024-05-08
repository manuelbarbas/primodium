import {
  Has,
  HasValue,
  defineUpdateSystem,
  defineEnterSystem,
  defineExitSystem,
  defineSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { createObjectApi } from "@/game/api/objects";
import { world } from "src/network/world";
import { Mode } from "src/util/constants";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { BaseAsteroid } from "@/game/lib/objects/Asteroid/BaseAsteroid";
import { Fleet } from "@/game/lib/objects/Fleet";

export const renderOverview = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const objects = createObjectApi(scene);

  const selectedRockWorld = namespaceWorld(world, "selectedRock");
  // this is so this only runs when selected rock and command is set
  const query = [
    Has(components.SelectedRock),
    HasValue(components.SelectedMode, {
      value: Mode.CommandCenter,
    }),
  ];

  let asteroidToDispose: BaseAsteroid | undefined;
  const fleetsToDispose: Fleet[] = [];
  defineEnterSystem(systemsWorld, query, () => {
    const entity = components.SelectedRock.get()?.value;

    if (!entity) return;

    selectedRockWorld.dispose();

    if (!entity) return;

    let asteroid: BaseAsteroid | undefined;
    if (components.ShardAsteroid.has(entity)) {
      asteroid = renderShardAsteroid({ scene, entity, coord: { x: 0, y: 0 } });
    } else
      asteroid = renderAsteroid({
        scene,
        entity,
        coord: { x: 0, y: 0 },
      });

    asteroidToDispose = asteroid;

    //mount fleet system
    defineSystem(
      selectedRockWorld,
      [
        HasValue(components.FleetMovement, {
          destination: entity,
        }),
      ],
      (update) => {
        const [newMovement, oldMovement] = update.value;

        if (newMovement) {
          const time = components.Time.get()?.value ?? 0n;
          const arrivalTime = (newMovement.arrivalTime as bigint) ?? 0n;
          if (arrivalTime <= time) {
            if (!asteroid) return;

            const fleet = renderFleet({
              scene,
              entity,
            });

            fleetsToDispose.push(fleet);

            asteroid.getOrbitRing()?.addFleet(fleet);
          } else {
            return;
          }
        } else if (oldMovement) {
          const fleet = objects.getFleet(update.entity);
          fleet?.dispose();
        }
      }
    );
  });

  defineUpdateSystem(systemsWorld, query, () => {
    console.log("here");
  });

  defineExitSystem(systemsWorld, query, () => {
    selectedRockWorld.dispose();

    asteroidToDispose?.dispose();

    fleetsToDispose.forEach((fleet) => {
      fleet.dispose();
    });
  });
};
