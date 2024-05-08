import { HasValue, defineComponentSystem, defineSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { Mode } from "src/util/constants";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";

export const renderOverview = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const selectedRockWorld = namespaceWorld(world, "selectedRock");
  defineComponentSystem(systemsWorld, components.SelectedRock, () => {
    // if (components.SelectedMode.get()?.value !== Mode.CommandCenter) return;

    const entity = components.SelectedRock.get()?.value;

    scene.objects.remove(`command_asteroid`);
    selectedRockWorld.dispose();

    if (!entity) return;

    if (components.ShardAsteroid.has(entity)) {
      renderShardAsteroid({ scene, entity, coord: { x: 0, y: 0 }, objectId: "command_asteroid" });
    } else
      renderAsteroid({
        scene,
        entity,
        coord: { x: 0, y: 0 },
        objectId: "command_asteroid",
      });

    //mount fleet system
    defineSystem(
      selectedRockWorld,
      [
        HasValue(components.FleetMovement, {
          destination: entity,
        }),
      ],
      ({ entity }) => {
        if (components.SelectedMode.get()?.value !== Mode.CommandCenter) return;

        console.log(entity);
      }
    );
  });
};
