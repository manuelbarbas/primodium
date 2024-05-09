import { HasValue, namespaceWorld, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { createObjectApi } from "@/game/api/objects";
import { world } from "src/network/world";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";

export const renderOverview = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const objects = createObjectApi(scene);

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

    for (const fleet of runQuery([HasValue(components.FleetMovement, { destination: entity })])) {
      const fleetObject = renderFleet({ scene, entity: fleet });
      asteroid?.getFleetContainer().addFleet(fleetObject);
    }

    //TODO: handle fleet orbit updates
  });
};
