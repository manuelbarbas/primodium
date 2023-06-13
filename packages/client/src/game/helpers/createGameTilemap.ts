import { Coord } from "@latticexyz/utils";
import { createTilemap } from "@smallbraingames/small-phaser";

const createGameTilemap = (
  scene: Phaser.Scene,
  tilesetKey: string,
  tileWidth: number,
  tileHeight: number,
  gridSize: number
) => {
  const tilemap = createTilemap(scene, tileWidth, tileHeight, gridSize);

  const tileset = tilemap.addTilesetImage(
    tilesetKey,
    tilesetKey,
    tileWidth,
    tileHeight
  );

  if (!tileset) {
    throw Error("Tileset is null");
  }

  const startX = -gridSize / 2;
  const startY = startX;

  const layer = tilemap.createBlankLayer(
    tilesetKey + "-layer",
    tileset,
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
      -tileCoord.y + gridSize / 2
    );
  };

  const removeTileAt = (tileCoord: Coord) => {
    layer.removeTileAt(tileCoord.x + gridSize / 2, -tileCoord.y + gridSize / 2);
  };

  const getTileAt = (tileCoord: Coord) => {
    return layer.getTileAt(
      tileCoord.x + gridSize / 2,
      tileCoord.y + gridSize / 2
    );
  };

  return {
    tilemap,
    phaserLayer: layer,
    putTileAt,
    removeTileAt,
    getTileAt,
  };
};

export default createGameTilemap;
