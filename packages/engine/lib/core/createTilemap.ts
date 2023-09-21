import { createChunks } from "@latticexyz/phaserx";
import type { createCamera } from "@latticexyz/phaserx";
import { SceneConfig, TileAnimation } from "../../types";
import { createAnimatedTilemap } from "./tilemap/createAnimatedTilemap";

export const createTilemap = (
  scene: Phaser.Scene,
  camera: ReturnType<typeof createCamera>,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number,
  tilesets: SceneConfig["tilemap"]["tilesets"],
  layerConfig: SceneConfig["tilemap"]["layerConfig"],
  animations: TileAnimation[] = [],
  animationInterval = 100,
  backgroundTile: [number, ...number[]] = [0]
) => {
  //create empty tilemap to create tilesets
  const emptyMap = new Phaser.Tilemaps.Tilemap(
    scene,
    new Phaser.Tilemaps.MapData()
  );

  const generatedTilesets: Record<string, Phaser.Tilemaps.Tileset> = {};

  if (tilesets) {
    for (const [key, value] of Object.entries(tilesets)) {
      try {
        generatedTilesets[key] = emptyMap.addTilesetImage(
          key,
          value.key,
          value.tileWidth,
          value.tileHeight,
          value.extrusion ?? 0,
          value.extrusion ? value.extrusion * 2 : 0,
          value.gid ?? 0
        )!;
      } catch (e) {
        throw new Error("Failed to load tileset: " + key + "/" + value);
      }
    }
  }

  //set up chunk
  const chunks = createChunks(camera.worldView$, chunkSize * tileWidth);

  const tilemap = layerConfig
    ? createAnimatedTilemap({
        scene,
        chunks,
        tileWidth,
        tileHeight,
        backgroundTile,
        tilesets: generatedTilesets,
        layerConfig,
        animationInterval,
      })
    : emptyMap;

  //register tilemap animations
  if (!(tilemap instanceof Phaser.Tilemaps.Tilemap)) {
    for (const anim of animations) {
      tilemap.registerAnimation(anim.key, anim.frames);
    }
  }

  return {
    chunkSize,
    tileHeight,
    tileWidth,
    map: tilemap,
    chunks,
    dispose: () => {
      if (!(tilemap instanceof Phaser.Tilemaps.Tilemap)) tilemap.dispose();
    },
  };
};
