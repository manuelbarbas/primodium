import { Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { EntityType } from "@primodiumxyz/core/util/constants";

import { PrimodiumScene } from "@/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/lib/objects/asteroid/DeferredAsteroidsRenderContainer";
import { renderAsteroid } from "@/lib/render/renderAsteroid";
import { initializeSecondaryAsteroids } from "@/scenes/starmap/systems/utils/initializeSecondaryAsteroids";

export const renderAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const deferredAsteroidsRenderContainer = new DeferredAsteroidsRenderContainer({
    id: EntityType.Asteroid,
    scene,
    spawnCallback: async ({ scene, entity, coord, spawnsSecondary }) => {
      // TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
      await new Promise((resolve) => setTimeout(resolve, 0));

      const asteroid = renderAsteroid({
        scene,
        entity,
        coord,
        addEventHandlers: true,
      });

      if (spawnsSecondary) initializeSecondaryAsteroids(entity, coord);

      return asteroid;
    },
  });

  const query = [Has(components.Asteroid), Has(components.Position)];
  defineEnterSystem(systemsWorld, query, ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    deferredAsteroidsRenderContainer.add(entity, coord, {
      scene,
      entity,
      coord,
      spawnsSecondary: asteroidData?.spawnsSecondary ?? false,
    });
  });
};
