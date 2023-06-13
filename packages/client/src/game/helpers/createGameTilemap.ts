import { Coord } from "@latticexyz/utils";
import { createTilemap } from "@smallbraingames/small-phaser";

import { GameConfig } from "../../util/types";

const createGameTilemap = (scene: Phaser.Scene, config: GameConfig) => {
  const {
    tilemap: { tileWidth, tileHeight, gridSize },
    assetKeys: {
      tilesets: { terrain: terrainTilesetAssetKey, ore: oreTilesetAssetKey },
    },
  } = config;
  const tilemap = createTilemap(scene, tileWidth, tileHeight, gridSize);

  const terrain = tilemap.addTilesetImage(
    terrainTilesetAssetKey,
    terrainTilesetAssetKey,
    tileWidth,
    tileHeight
  );

  const ore = tilemap.addTilesetImage(
    oreTilesetAssetKey,
    oreTilesetAssetKey,
    tileWidth,
    tileHeight
  );

  if (!terrain || !ore) {
    throw Error("Tileset is null");
  }

  const startX = -gridSize / 2;
  const startY = startX;
  const layer = tilemap.createBlankLayer(
    "terrain-layer",
    [ore, terrain],
    startX * tileWidth,
    startY * tileHeight,
    gridSize,
    gridSize
  );

  if (!layer) {
    throw Error("Layer is null");
  }

  const putTileAt = (tile: number, tileCoord: Coord) => {
    layer.putTileAt(
      tile,
      tileCoord.x + gridSize / 2,
      tileCoord.y + gridSize / 2
    );
  };

  const removeTileAt = (tileCoord: Coord) => {
    layer.removeTileAt(tileCoord.x + gridSize / 2, tileCoord.y + gridSize / 2);
  };

  const getTileAt = (tileCoord: Coord) => {
    return layer.getTileAt(
      tileCoord.x + gridSize / 2,
      tileCoord.y + gridSize / 2
    );
  };

  return { tilemap, layer, putTileAt, removeTileAt, getTileAt };
};

export default createGameTilemap;
