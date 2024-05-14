import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { PrimodiumScene } from "@/game/api/scene";
import { renderDeferredShardAsteroid } from "@/game/lib/render/renderDeferredShardAsteroid";

export const renderShardAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const { objects } = scene;

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    const asteroid = objects.asteroid.get(entity);

    // TODO: explode

    if (!asteroid) return;

    asteroid.getFleetsContainer().destroy();
    asteroid.setTilePosition(coord);
  };

  const query = [Has(components.ShardAsteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderDeferredShardAsteroid({ scene, entity, coord });
  });

  defineUpdateSystem(systemsWorld, query, async ({ entity, component }) => {
    if (component.id !== components.Position.id) return;
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderExplodeAndMoveAsteroid(entity, coord);
  });
};
