import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { EntityType } from "@/util/constants";

export const renderShardAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const deferredContainer = new DeferredAsteroidsRenderContainer({
    id: EntityType.DeferredRenderShards,
    scene,
    spawnCallback: ({ scene, entity, coord }) => renderShardAsteroid({ scene, entity, coord, addEventHandlers: true }),
    isShard: true,
  });

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    deferredContainer.explode(entity, coord);
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
