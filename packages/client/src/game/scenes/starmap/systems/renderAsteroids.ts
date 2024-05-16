import { Entity, Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "@/network/components";
import { world } from "@/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { initializeSecondaryAsteroids } from "@/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { toHex } from "viem";

export const renderAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const deferredAsteroidsRenderContainer = new DeferredAsteroidsRenderContainer({
    id: toHex("asteroids") as Entity,
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

    // init informations
    const owner = (components.OwnedBy.get(entity)?.value as Entity) ?? singletonEntity;
    components.AsteroidInfo.set({
      owner,
      expansionLevel: components.Level.get(entity)?.value ?? 1n,
      ownerAlliance: (components.PlayerAlliance.get(owner)?.alliance as Entity) ?? singletonEntity,
    });

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
