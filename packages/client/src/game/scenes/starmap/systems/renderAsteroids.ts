import { Has, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { initializeSecondaryAsteroids } from "./utils/initializeSecondaryAsteroids";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";

export const renderAsteroids = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const query = [Has(components.Asteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    const asteroidData = components.Asteroid.get(entity);

    if (!coord) return;

    // //TODO: not sure why this is needed but rendering of unitialized asteroids wont work otherwise
    await new Promise((resolve) => setTimeout(resolve, 0));

    renderAsteroid({
      scene,
      entity,
      coord,
      addEventHandlers: true,
    });

    if (asteroidData?.spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
  });
};
