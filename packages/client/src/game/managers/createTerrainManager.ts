import { Coord, coordToKey } from "@latticexyz/utils";
import {
  createLazyGameObjectManager,
  tileCoordToPixelCoord,
} from "@smallbraingames/small-phaser";

import { Game } from "../../util/types";
import { GameObjects } from "phaser";
import { Terrain } from "../../util/types";
import { createPerlin } from "@latticexyz/noise";
import { getTerrainKey } from "../../util/tile";

const createTerrainManager = async (game: Game) => {
  const {
    mainScene: {
      camera,
      config: {
        tilemap: { gridSize, tileHeight, tileWidth },
      },
    },
  } = game;
  const perlin = await createPerlin();

  const createGameObject = (coord: Coord) => {
    return createTerrain(coord);
  };

  const lazyGameObjectManager = createLazyGameObjectManager<GameObjects.Sprite>(
    camera,
    createGameObject,
    { tileWidth, tileHeight }
  );

  const createTerrain = (coord: Coord) => {
    //create terrain sprite object from tilemap
    const terrain = getTerrainKey(coord, perlin);

    return textGameObject;
  };

  const lazyAddTerrain = async () => {
    const halfGridSize = gridSize / 2;
    for (let x = -halfGridSize; x < halfGridSize; x++) {
      for (let y = -halfGridSize; y < halfGridSize; y++) {
        const coord = { x, y };
        const terrain = getTerrainKey(coord, perlin);
        lazyGameObjectManager.addGameObject(coord, terrain + coord);
      }
    }
    lazyGameObjectManager.initialize();
  };

  return lazyAddTerrain;
};

export default createTerrainManager;
