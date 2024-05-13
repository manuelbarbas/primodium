import { Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { PrimodiumScene } from "@/game/api/scene";
import { renderDeferredAsteroid } from "@/game/lib/render/renderDeferredAsteroid";
import { world } from "src/network/world";

export const renderAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [Has(components.Asteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    // //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    renderDeferredAsteroid({
      scene,
      entity,
      coord,
      spawnsSecondary: asteroidData?.spawnsSecondary ?? false,
    });
  });
};
