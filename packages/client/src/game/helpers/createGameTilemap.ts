import {
  createAnimatedTilemap,
  createChunks,
  createCamera,
} from "@latticexyz/phaserx";
import { Tileset } from "../constants";
import Phaser from "phaser";

const createGameTilemap = (
  scene: Phaser.Scene,
  camera: ReturnType<typeof createCamera>,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number
) => {
  //create empty tilemap to create tilesets
  const emptyMap = new Phaser.Tilemaps.Tilemap(
    scene,
    new Phaser.Tilemaps.MapData()
  );

  const terrainTileset = emptyMap.addTilesetImage(
    "terrain-tileset",
    "terrain-tileset",
    tileWidth,
    tileHeight
  );

  const resourceTileset = emptyMap.addTilesetImage(
    "resource-tileset",
    "resource-tileset",
    tileWidth,
    tileHeight
  );

  if (!resourceTileset || !terrainTileset) {
    throw Error("Tileset is null");
  }

  //set up chunk
  const chunks = createChunks(camera.worldView$, chunkSize * tileWidth);

  const tilemap = createAnimatedTilemap({
    scene,
    chunks,
    tileWidth,
    tileHeight,
    backgroundTile: [
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Bedrock,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      // Tileset.Air,
    ],
    tilesets: {
      "resource-tileset": resourceTileset,
      "terrain-tileset": terrainTileset,
    },
    layerConfig: {
      layers: {
        Terrain: { tilesets: ["terrain-tileset"] },
        Resource: { tilesets: ["resource-tileset"] },
      },
      defaultLayer: "Terrain",
    },
    animationInterval: 200,
  });

  return {
    map: tilemap,
    chunks,
  };
};

export default createGameTilemap;
