import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { renderAsteroid } from "@/game/lib/render/renderAsteroid";
import { initializeSecondaryAsteroids } from "@/game/scenes/starmap/systems/utils/initializeSecondaryAsteroids";
import { DeferredRenderContainer } from "@/game/lib/objects/DeferrerRenderContainer";

export const renderDeferredAsteroid = (args: {
  scene: PrimodiumScene;
  entity: Entity;
  coord: Coord;
  spawnsSecondary: boolean;
}) => {
  const { scene, entity, coord, spawnsSecondary } = args;
  const spawnCallback = () => {
    const asteroid = renderAsteroid({
      scene,
      entity,
      coord,
      addEventHandlers: true,
    });

    if (spawnsSecondary) initializeSecondaryAsteroids(entity, coord);
    if (!asteroid) return undefined;

    // we need to manually spawn and set the asteroid, since at this point (during `onEnterChunk`) the visible chunks were not yet updated
    // meaning that it might not consider the asteroid visible yet, so it won't actually enter it
    if (!asteroid.isSpawned()) asteroid.spawn();
    asteroid.setActive(true).setVisible(true);

    // we don't need this object anymore: remove, destroy and decrement the count since it won't do it when exiting the chunk as it will not exist anymore
    scene.objects.deferredRenderContainer.remove(entity, true, true);

    return asteroid;
  };

  return new DeferredRenderContainer({ id: entity, scene, coord, spawnCallback });
};
