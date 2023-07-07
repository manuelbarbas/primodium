// import { SceneConfig } from "../../types";
import { SceneConfig } from "../../engine/types";
import { Assets, Scenes, Tilesets, Tilekeys } from "../constants";
import { animationConfig } from "./animationConfig";
import { tileAnimationConfig } from "./tileAnimationConfig";

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  assetPackUrl: Assets.Pack,
  camera: {
    minZoom: 2,
    maxZoom: 5,
    defaultZoom: 5,
    pinchSpeed: 0.1,
    scrollSpeed: 1,
    dragSpeed: 3,
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

export default mainSceneConfig;
