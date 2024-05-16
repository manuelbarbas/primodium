import { HasValue, namespaceWorld, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { renderFleet } from "@/game/lib/render/renderFleet";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { subscribeToAsteroidLabel } from "@/game/scenes/starmap/systems/asteroidLabelSystem";

export const renderOverview = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { objects } = scene;

  let unsub: (() => void) | undefined = undefined;
  systemsWorld.registerDisposer(() => unsub && unsub());
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
      if (unsub) unsub();
    }

    if (!entity) return;

    const asteroid = components.ShardAsteroid.has(entity)
      ? renderShardAsteroid({ scene, entity })
      : renderAsteroid({ scene, entity });

    // setup subscription to keep label updated (owner, alliance, expansion level, etc)
    if (unsub) unsub();
    if (asteroid) unsub = subscribeToAsteroidLabel(scene, asteroid, entity);

    for (const fleet of runQuery([HasValue(components.FleetMovement, { destination: entity })])) {
      const fleetObject = renderFleet({ scene, entity: fleet });
      asteroid?.getFleetsContainer().addFleet(fleetObject);
    }

    //TODO: handle fleet orbit updates
  });
};
