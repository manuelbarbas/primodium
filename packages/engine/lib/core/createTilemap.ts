import type { createCamera } from "@latticexyz/phaserx";
import { createChunks } from "@latticexyz/phaserx";
import { SceneConfig, TileAnimation, TilesetConfig } from "../../types";
import { createAnimatedTilemap } from "./tilemap/createAnimatedTilemap";

export const createTilemap = (
  scene: Phaser.Scene,
  camera: ReturnType<typeof createCamera>,
  tileWidth: number,
  tileHeight: number,
  chunkSize: number,
  tilesets: TilesetConfig,
  layerConfig: SceneConfig["tilemap"]["layerConfig"],
  animations: TileAnimation[] = [],
  animationInterval: number,
  backgroundTile: [number, ...number[]] = [0]
) => {
  //create empty tilemap to create tilesets
  const emptyMap = new Phaser.Tilemaps.Tilemap(scene, new Phaser.Tilemaps.MapData());

  const generatedTilesets: Record<string, Phaser.Tilemaps.Tileset> = {};
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

  //set up chunk
  const chunks = createChunks(camera.worldView$, chunkSize * tileWidth);

  const tilemap = createAnimatedTilemap({
    scene,
    chunks,
    tileWidth,
    tileHeight,
    backgroundTile,
    tilesets: generatedTilesets,
    layerConfig,
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
    dispose: () => {
      tilemap.dispose();
    },
  };
};
