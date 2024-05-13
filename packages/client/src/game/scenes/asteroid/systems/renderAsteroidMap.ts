import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { AsteroidMap } from "../../../lib/objects/AsteroidMap/AsteroidMap";
import { getAsteroidBounds as getAsteroidCurrentBounds, getAsteroidMaxBounds } from "src/util/outOfBounds";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { ResourceEntityLookup } from "src/util/constants";
import { EResource } from "contracts/config/enums";
import { PrimodiumScene } from "@/game/api/scene";

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderAsteroidMap = (scene: PrimodiumScene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  let asteroidMap: AsteroidMap;

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    if (value[0]?.value === value[1]?.value) return;

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

      const resourceId = ResourceEntityLookup[tileId as EResource];

      acc.push({ x, y, resourceType: resourceId });
      return acc;
    }, [] as { x: number; y: number; resourceType: Entity }[]);

    const asteroidDimensions = components.P_Asteroid.get();

    if (!asteroidDimensions) return;

    asteroidMap = new AsteroidMap(scene, asteroidDimensions)
      .drawMap(asteroidData.maxLevel)
      .drawBounds(currentBounds, maxBounds)
      .drawResources(tiles);

    const bounds = asteroidMap.getTilemapBounds();

    if (!bounds) return;

    //TODO: FIX WIERD JUMP
    // scene.camera.phaserCamera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
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
