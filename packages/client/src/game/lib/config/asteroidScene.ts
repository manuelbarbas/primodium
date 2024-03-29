import { SceneConfig } from "engine/types";
import { animationConfig } from "./animation";
import { DepthLayers, Scenes } from "../constants/common";
import { Tilemaps } from "../constants/assets/tiles";

export const asteroidSceneConfig: SceneConfig = {
  key: Scenes.Asteroid,
  camera: {
    minZoom: 1,
    maxZoom: 5,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 3,
  },
  animations: animationConfig,
  cullingChunkSize: 64,
  tilemap: {
    tileWidth: 32,
    tileHeight: 32,
    config: {
      [Tilemaps.AsteroidLarge]: {
        ["Fog"]: {
          depth: DepthLayers.Marker,
        },
      },
      [Tilemaps.AsteroidMedium]: {
        ["Fog"]: {
          depth: DepthLayers.Marker,
        },
      },
      [Tilemaps.AsteroidSmall]: {
        ["Fog"]: {
          depth: DepthLayers.Marker,
        },
      },
      [Tilemaps.AsteroidMicro]: {
        ["Fog"]: {
          depth: DepthLayers.Marker,
        },
      },
    },
  },
};
