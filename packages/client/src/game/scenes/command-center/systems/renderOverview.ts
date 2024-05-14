import { HasValue, namespaceWorld, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { Fleet } from "@/game/lib/objects/Fleet";

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

    const asteroid =
      components.ShardAsteroid.has(entity) && !objects.asteroid.get(entity)
        ? renderShardAsteroid({ scene, entity })
        : renderAsteroid({ scene, entity });
    const spawnQueue = new Set<Fleet>();

    if (!asteroid) {
      const unsub = objects.asteroid.onNewObject((id) => {
        if (id !== entity) return;

        if (spawnQueue.size) {
          const asteroid = objects.asteroid.get(entity);
          for (const fleet of spawnQueue) {
            asteroid!.getFleetsContainer().addFleet(fleet);
          }
        }
      });
      systemsWorld.registerDisposer(unsub);
    }

    for (const fleet of runQuery([HasValue(components.FleetMovement, { destination: entity })])) {
      const fleetObject = renderFleet({ scene, entity: fleet });
      if (asteroid) {
        asteroid.getFleetsContainer().addFleet(fleetObject);
      } else {
        spawnQueue.add(fleetObject);
      }
    }

    //TODO: handle fleet orbit updates
  });
};
