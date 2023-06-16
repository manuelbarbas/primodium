//NOT USED. FOR PHASERX CREATEPHASERENGINE. LEAVING FOR REFERENCE

import {
  defineSceneConfig,
  AssetType,
  defineScaleConfig,
  defineMapConfig,
  defineCameraConfig,
} from "@latticexyz/phaserx";

import terrainTileset from "../assets/tileset/terrain.png";

import {
  Tileset,
  TILE_HEIGHT,
  TILE_WIDTH,
  ANIMATION_INTERVAL,
  Assets,
  Maps,
  Scenes,
} from "../constants";

const createPhaserConfig = () => {
  const mainMap = defineMapConfig({
    chunkSize: 16 * 64,
    tileWidth: 16,
    tileHeight: TILE_HEIGHT,
    backgroundTile: [Tileset.Alluvium],
    animationInterval: ANIMATION_INTERVAL,
    // tileAnimations: TileAnimations,
    layers: {
      layers: {
        Terrain: { tilesets: ["Terrain"] },
      },
      defaultLayer: "Terrain",
    },
  });

  const mainScene = defineSceneConfig({
    assets: {
      [Assets.TerrainTileset]: {
        type: AssetType.Image,
        key: Assets.TerrainTileset,
        path: terrainTileset,
      },
    },
    animations: [],
    sprites: {},
    maps: {
      [Maps.Main]: mainMap,
    },
    tilesets: {
      Terrain: {
        assetKey: Assets.TerrainTileset,
        tileWidth: TILE_WIDTH,
        tileHeight: TILE_HEIGHT,
      },
    },
  });

  return {
    sceneConfig: {
      [Scenes.Main]: mainScene,
    },
    scale: defineScaleConfig({
      parent: "phaser-container",
      zoom: 1,
      mode: Phaser.Scale.NONE,
    }),
    cameraConfig: defineCameraConfig({
      pinchSpeed: 1,
      wheelSpeed: 1,
      maxZoom: 3,
      minZoom: 1,
    }),
    cullingChunkSize: TILE_HEIGHT * 16,
  };
};

export default createPhaserConfig;
