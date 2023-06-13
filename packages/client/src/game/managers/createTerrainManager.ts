import { Coord, coordToKey } from "@latticexyz/utils";
import {
  createLazyGameObjectManager,
  tileCoordToPixelCoord,
} from "@smallbraingames/small-phaser";

import { Game, Terrain } from "../../util/types";
import { GameObjects } from "phaser";
import { createPerlin } from "@latticexyz/noise";
import { getTerrainKey, getTopLayerKeyPair } from "../../util/tile";
import { BlockTypetoTerrainTileset } from "../../util/constants";

const createTerrainManager = async (game: Game) => {
  const {
    mainScene: {
      scene,
      camera,
      tilemap,
      config: {
        tilemap: { gridSize, tileHeight, tileWidth },
      },
    },
  } = game;
  const perlin = await createPerlin();

  const createGameObject = (coord: Coord) => {
    return createTerrain(coord);
  };

  const lazyGameObjectManager = createLazyGameObjectManager<GameObjects.Text>(
    camera,
    createGameObject,
    { tileWidth, tileHeight }
  );

  const createTerrain = (coord: Coord) => {
    //create terrain sprite object from tilemap
    const terrain = getTerrainKey(coord, perlin);
    // if (terrain === Terrain.BARE) {
    //   throw Error("No terrain at bare tile");
    // }
    const position = tileCoordToPixelCoord(coord, tileWidth, tileHeight);
    // const text = getTerrainText(terrain);

    const textGameObject = scene.add.text(
      position.x,
      position.y,
      `${coord.x},${coord.y}`,
      {
        fontSize: "5px",
      }
    );
    textGameObject.setPosition(
      position.x + tileWidth / 2 - textGameObject.width / 2,
      position.y + tileHeight / 2 - textGameObject.height / 2
    );
    return textGameObject;

    // return textGameObject;
  };

  const lazyAddTerrain = () => {
    const halfGridSize = gridSize / 2;
    for (let x = -halfGridSize; x < halfGridSize; x++) {
      for (let y = -halfGridSize; y < halfGridSize; y++) {
        const coord = { x, y };
        const { terrain, resource } = getTopLayerKeyPair(coord, perlin);

        const terrainTile = BlockTypetoTerrainTileset[terrain];
        // const resourceTile = BlockTypetoResourceTileset[resource];
        tilemap.putTileAt(terrainTile ?? Terrain.ALLUVIUM, { x, y: -y });
      }
    }
    lazyGameObjectManager.initialize();
  };

  return { lazyAddTerrain };
};

export default createTerrainManager;
