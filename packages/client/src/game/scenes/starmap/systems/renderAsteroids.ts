import { Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "@/network/components";
import { world } from "@/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { initializeSecondaryAsteroids } from "@/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { EntityType } from "@/util/constants";

export const renderAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const deferredAsteroidsRenderContainer = new DeferredAsteroidsRenderContainer({
    id: EntityType.DeferredRenderAsteroids,
    scene,
    spawnCallback: ({ scene, entity, coord, spawnsSecondary }) => {
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

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    // //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    deferredAsteroidsRenderContainer.add(entity, coord, {
      scene,
      entity,
      coord,
      spawnsSecondary: asteroidData?.spawnsSecondary ?? false,
    });
  });
};
