import { HasValue, namespaceWorld, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { singletonEntity } from "@latticexyz/store-sync/recs";

export const renderOverview = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { objects } = scene;

  defineComponentSystem(systemsWorld, components.SelectedRock, ({ value }) => {
    const entity = value[0]?.value;
    const prevEntity = value[1]?.value;

    if (entity === prevEntity) return;

    if (prevEntity) {
      const asteroid = objects.asteroid.get(prevEntity);

      for (const fleet of runQuery([HasValue(components.FleetMovement, { destination: prevEntity })])) {
        const fleetObject = objects.fleet.get(fleet);
        fleetObject?.destroy();
      }
      asteroid?.destroy();
    }

    if (!entity) return;

    const asteroid = components.ShardAsteroid.has(entity)
      ? renderShardAsteroid({ scene, entity })
      : renderAsteroid({ scene, entity });

    asteroid?.onClick(() => {
      components.BattleTarget.set({
        value: entity,
      });
    }, true);

    for (const fleet of runQuery([HasValue(components.FleetMovement, { destination: entity })])) {
      const fleetObject = renderFleet({ scene, entity: fleet });
      fleetObject?.onClick(() => {
        components.BattleTarget.set({
          value: fleet,
        });
      });
      asteroid?.getFleetContainer().addFleet(fleetObject);
    }

    //TODO: handle fleet orbit updates
  });

  defineComponentSystem(systemsWorld, components.BattleTarget, ({ value }) => {
    const entity = value[0]?.value;
    const prevEntity = value[1]?.value;

    if (entity === prevEntity) return;

    const asteroidEntity = components.SelectedRock.get()?.value;

    if (!asteroidEntity) return;

    const asteroidObj = objects.asteroid.get(asteroidEntity);

    if (!entity) {
      asteroidObj?.getFleetContainer().resumeRotation();
    } else asteroidObj?.getFleetContainer().pauseRotation();

    //set outlines
    const obj = components.IsFleet.get(entity)?.value
      ? objects.fleet.get(entity ?? singletonEntity)
      : entity
      ? asteroidObj
      : null;

    const prevObj = components.IsFleet.get(prevEntity)?.value
      ? objects.fleet.get(prevEntity ?? singletonEntity)
      : prevEntity
      ? asteroidObj
      : null;

    obj?.setOutline(0xff0000);
    prevObj?.removeOutline();
  });
};
