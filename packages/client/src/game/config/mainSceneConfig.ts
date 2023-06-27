// import { SceneConfig } from "../../types";
import { SceneConfig } from "../../engine/types";
import { Assets, Scenes, Tilesets, Tilekeys } from "../constants";
import { animationConfig } from "./animationConfig";
import { tileAnimationConfig } from "./tileAnimationConfig";

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  assetPackUrl: Assets.Pack,
  camera: {
    minZoom: 1,
    maxZoom: 5,
    defaultZoom: 2,
    pinchSpeed: 0.2,
    scrollSpeed: 0.5,
    dragSpeed: 1.5,
  },
  animations: animationConfig,
  cullingChunkSize: 32,
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    chunkSize: 32,
    tilesets: {
      [Tilesets.Terrain]: {
        key: Assets.TerrainTileset,
        tileHeight: 16,
        tileWidth: 16,
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

export default mainSceneConfig;
