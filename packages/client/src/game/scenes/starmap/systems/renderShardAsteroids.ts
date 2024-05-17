import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { ShardAsteroid } from "@/game/lib/objects/Asteroid/ShardAsteroid";
import { toHex } from "viem";

export const renderShardAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { objects } = scene;

  const deferredContainer = new DeferredAsteroidsRenderContainer({
    id: toHex("shardAsteroids") as Entity,
    scene,
    spawnCallback: ({ scene, entity, coord }) => renderShardAsteroid({ scene, entity, coord, addEventHandlers: true }),
  });

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    const asteroid = objects.asteroid.get(entity) as ShardAsteroid;

    // it might now have been spawned yet, so check the container
    if (!asteroid) {
      deferredContainer.updatePosition(entity, coord);
      deferredContainer.getFleetsContainers(entity)?.clearOrbit();
      // no need for exploding, etc; the container will handle moving it, and if it becomes visible it will be spawned
      return;
    }

    // the asteroid is already spawned, so we can explode it (it's one animation, no need to check for visibility),
    // also if the player visits it during the animation...
    asteroid.explode(coord);
  };

  const query = [Has(components.ShardAsteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    if (!coord) return;

    deferredContainer.add(entity, coord, {
      scene,
      entity,
      coord,
      // no need to create a separate class just for this
      spawnsSecondary: false,
    });
  });

  defineUpdateSystem(systemsWorld, query, async ({ entity, component }) => {
    if (component.id !== components.Position.id) return;
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderExplodeAndMoveAsteroid(entity, coord);
  });
};
