import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { AsteroidMap } from "../../../objects/AsteroidMap/AsteroidMap";
import { getAsteroidBounds as getAsteroidCurrentBounds, getAsteroidMaxBounds } from "src/util/outOfBounds";
import { decodeEntity } from "@latticexyz/store-sync/recs";

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderAsteroidMap = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  let asteroidMap: AsteroidMap;

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    const activeRock = value[0]?.value as Entity;

    if (!activeRock) return;

    const asteroidData = components.Asteroid.get(activeRock);

    if (!asteroidData) return;

    const maxBounds = getAsteroidMaxBounds(activeRock);
    const currentBounds = getAsteroidCurrentBounds(activeRock);

    if (asteroidMap) asteroidMap.dispose();

    const terrain = components.P_Terrain.getAll();

    const tiles = terrain.reduce((acc, tile) => {
      const tileId = components.P_Terrain.get(tile)?.value;

      if (!tileId) return acc;

      const { mapId, x, y } = decodeEntity(components.P_Terrain.metadata.keySchema, tile);
      if (mapId !== asteroidData.mapId) return acc;

      acc.push({ x, y, id: tileId });
      return acc;
    }, [] as { x: number; y: number; id: number }[]);

    const asteroidDimensions = components.P_Asteroid.get();

    if (!asteroidDimensions) return;

    asteroidMap = new AsteroidMap(scene, asteroidDimensions)
      .drawMap(asteroidData.maxLevel)
      .drawBounds(currentBounds, maxBounds)
      .drawResources(tiles);
  });

  defineComponentSystem(systemsWorld, components.Level, ({ entity }) => {
    const activeRock = components.ActiveRock.get()?.value;
    if (!activeRock || activeRock !== entity) return;

    const maxBounds = getAsteroidMaxBounds(activeRock);
    const currentBounds = getAsteroidCurrentBounds(activeRock);
    asteroidMap.drawBounds(currentBounds, maxBounds);
  });

  systemsWorld.registerDisposer(() => {
    asteroidMap?.dispose();
  });
};
