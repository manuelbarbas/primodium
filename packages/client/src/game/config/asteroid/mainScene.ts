// import { SceneConfig } from "../../types";
import { SceneConfig } from "engine/types";
import { AsteroidMap } from "../../constants";
import { animationConfig } from "./animation";
import { tileAnimationConfig } from "./tileAnimation";

const { Assets, Scenes, Tilesets } = AsteroidMap;

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  camera: {
    minZoom: Math.max(1, window.devicePixelRatio),
    maxZoom: window.devicePixelRatio * 5,
    defaultZoom: window.devicePixelRatio * 3,
    pinchSpeed: 0.01,
    wheelSpeed: 3,
  },
  animations: animationConfig,
  cullingChunkSize: 64,
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    chunkSize: 32,
    tilesets: {
      [Tilesets.Terrain]: {
        key: Assets.TerrainTileset,
        tileHeight: 16,
        tileWidth: 16,
        extrusion: 1,
      },
      [Tilesets.Resource]: {
        key: Assets.ResourceTileset,
        tileHeight: 16,
        tileWidth: 16,
      },
    },
    layerConfig: {
      layers: {
        Terrain: {
          tilesets: [Tilesets.Terrain, Tilesets.Terrain],
        },
        Resource: {
          tilesets: [Tilesets.Resource, Tilesets.Resource],
        },
      },
      defaultLayer: Tilesets.Terrain,
    },
    tileAnimations: tileAnimationConfig,
    animationInterval: 200,
  },
};

export default mainSceneConfig;
