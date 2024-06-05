import { defineEnterSystem, defineUpdateSystem, Entity, Has, namespaceWorld } from "@latticexyz/recs";
import { Coord } from "@primodiumxyz/engine/types";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { PrimodiumScene } from "@/api/scene";
import { renderShardAsteroid } from "@/lib/render/renderShardAsteroid";
import { ShardAsteroid } from "@/lib/objects/asteroid/ShardAsteroid";

export const renderShardAsteroids = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const renderExplodeAndMoveAsteroid = (entity: Entity, coord: Coord) => {
    const asteroid = scene.objects.asteroid.get(entity) as ShardAsteroid;
    asteroid.explode(coord);
  };

  const query = [Has(components.ShardAsteroid), Has(components.Position)];

  defineEnterSystem(systemsWorld, query, async ({ entity }) => {
    const coord = components.Position.get(entity);
    if (!coord) return;

    renderShardAsteroid({ scene, entity, coord, addEventHandlers: true });
  });

  defineUpdateSystem(systemsWorld, query, async ({ entity, component }) => {
    if (component.id !== components.Position.id) return;
    const coord = components.Position.get(entity);

    if (!coord) return;

    renderExplodeAndMoveAsteroid(entity, coord);
  });
};
