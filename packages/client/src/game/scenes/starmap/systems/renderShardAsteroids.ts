import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
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
    const asteroid = objects.asteroid.get(entity);
    // it might now have been spawned yet, so check the container
    if (!asteroid && !deferredContainer.isSpawned(entity)) {
      deferredContainer.updatePosition(entity, coord);
      deferredContainer.getFleetsContainers(entity)?.clearOrbit();
      // no need for exploding, etc; the container will handle moving it, and if it becomes visible it will be spawned
      return;
    }
    if (!asteroid) return;

    // TODO: explode

    asteroid.getFleetsContainer().clearOrbit();
    // keep pixels to chunk in the object manager scope
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    objects.asteroid.updatePosition(entity, { x: pixelCoord.x, y: -pixelCoord.y });
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
