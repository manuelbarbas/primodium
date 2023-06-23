import { createAnimatedTilemap, createChunks } from "@latticexyz/phaserx";
import type { createCamera } from "@latticexyz/phaserx";
import { Tileset } from "../constants";
import { TileAnimation } from "../../util/types";

export const createTilemap = (
  scene: Phaser.Scene,
  camera: ReturnType<typeof createCamera>,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number,
  animations: TileAnimation[] = [],
  animationInterval: number
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
      Tileset.Bedrock,
      Tileset.Bedrock,
      Tileset.Bedrock,
      Tileset.Bedrock,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Alluvium,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
      Tileset.Regolith,
    ],
    tilesets: {
      "resource-tileset": resourceTileset,
      "terrain-tileset": terrainTileset,
    },
    layerConfig: {
      layers: {
        Terrain: {
          tilesets: ["terrain-tileset", "terrain-tileset"],
        },
        Resource: {
          tilesets: ["resource-tileset", "resource-tileset"],
        },
      },
      defaultLayer: "Terrain",
    },
    animationInterval,
  });

  //register tilemap animations
  for (const anim of animations) {
    tilemap.registerAnimation(anim.key, anim.frames);
  }

  return {
    chunkSize,
    tileHeight,
    tileWidth,
    map: tilemap,
    chunks,
  };
};

export default createTilemap;
