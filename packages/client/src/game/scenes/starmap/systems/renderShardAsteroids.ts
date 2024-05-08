import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { createObjectApi } from "src/game/api/objects";
import { components } from "src/network/components";
import { world } from "src/network/world";

export const renderShardAsteroids = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");
  const objects = createObjectApi(scene);

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    const asteroid = objects.getAsteroid(entity);

    // TODO: explode

    if (!asteroid) return;

    asteroid.getOrbitRing().clear();
    asteroid.setTilePosition(coord);
  };

  const query = [Has(components.ShardAsteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderShardAsteroid({ scene, entity, addEventHandlers: true, coord });
  });

  defineUpdateSystem(systemsWorld, query, async ({ entity, component }) => {
    if (component.id !== components.Position.id) return;
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderExplodeAndMoveAsteroid(entity, coord);
  });
};
