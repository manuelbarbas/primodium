import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { decodeEntity } from "@primodiumxyz/reactive-tables/utils";
import { Core, ResourceEntityLookup } from "@primodiumxyz/core";

import { EResource } from "contracts/config/enums";
import { PrimodiumScene } from "@game/types";
import { AsteroidMap } from "@game/lib/objects/asteroid-map/AsteroidMap";

//TODO: Temp system implementation. Logic be replaced with state machine instead of direct obj manipulation
export const renderAsteroidMap = (scene: PrimodiumScene, core: Core) => {
  const {
    network: { world },
    tables,
    utils,
  } = core;

  const systemsWorld = namespaceWorld(world, "systems");

  let asteroidMap: AsteroidMap;

  tables.ActiveRock.watch({
    world: systemsWorld,
    onChange: ({ properties: { current, prev } }) => {
      if (current?.value === prev?.value) return;

      const activeRock = current?.value;
      if (!activeRock) return;

      const asteroidData = tables.Asteroid.get(activeRock);
      if (!asteroidData) return;

      const maxBounds = utils.getAsteroidMaxBounds(activeRock);
      const currentBounds = utils.getAsteroidBounds(activeRock);

      if (asteroidMap) asteroidMap.dispose();

      const terrain = tables.P_Terrain.getAll();
      const tiles = terrain.reduce((acc, tile) => {
        const tileId = tables.P_Terrain.get(tile)?.value;
        if (!tileId) return acc;
        const { mapId, x, y } = decodeEntity(tables.P_Terrain.metadata.abiKeySchema, tile);
        if (mapId !== asteroidData.mapId) return acc;
        const resourceId = ResourceEntityLookup[tileId as EResource];
        acc.push({ x, y, resourceType: resourceId });
        return acc;
      }, [] as { x: number; y: number; resourceType: Entity }[]);
      const asteroidDimensions = tables.P_Asteroid.get();
      if (!asteroidDimensions) return;
      asteroidMap = new AsteroidMap(scene, asteroidDimensions)
        .drawMap(asteroidData.maxLevel)
        .drawBounds(currentBounds, maxBounds)
        .drawResources(tiles);
      const bounds = asteroidMap.getTilemapBounds();
      if (!bounds) return;
      //TODO: FIX WIERD JUMP
      // scene.camera.phaserCamera.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    },
  });

  tables.Level.watch({
    world: systemsWorld,
    onChange: ({ entity }) => {
      const activeRock = tables.ActiveRock.get()?.value;
      if (!activeRock || activeRock !== entity) return;

      const maxBounds = utils.getAsteroidMaxBounds(activeRock);
      const currentBounds = utils.getAsteroidBounds(activeRock);
      asteroidMap.drawBounds(currentBounds, maxBounds);
    },
  });

  systemsWorld.registerDisposer(() => {
    asteroidMap?.dispose();
  });
};
