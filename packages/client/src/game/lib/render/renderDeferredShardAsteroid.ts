import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { renderShardAsteroid } from "@/game/lib/render/renderShardAsteroid";
import { DeferredAsteroidRenderContainer } from "@/game/lib/render/renderDeferredAsteroid";

export const renderDeferredShardAsteroid = (args: { scene: PrimodiumScene; entity: Entity; coord: Coord }) => {
  const { scene, entity, coord } = args;

  const render = () => renderShardAsteroid({ scene, entity, addEventHandlers: true, coord });
  const spawnCallback = () => render();

  return new DeferredAsteroidRenderContainer({ id: entity, scene, coord, spawnCallback, render });
};
