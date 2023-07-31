// import { SceneConfig } from "../../types";
import { SceneConfig } from "engine/types";
import { Assets, Scenes, Tilesets, Tilekeys } from "../constants";
import { animationConfig } from "./animationConfig";
import { tileAnimationConfig } from "./tileAnimationConfig";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.STARMAP,
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
    chunkSize: 64,
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
    backgroundTile: [
      Tilekeys.Bedrock,
      Tilekeys.Bedrock,
      Tilekeys.Bedrock,
      Tilekeys.Bedrock,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Alluvium,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
      Tilekeys.Regolith,
    ],
    tileAnimations: tileAnimationConfig,
    animationInterval: 100,
  },
};
