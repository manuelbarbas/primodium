import { SceneConfig } from "@primodiumxyz/engine/types";
import { AnimationConfig, Tilemaps } from "@primodiumxyz/assets";

import { DepthLayers, Scenes } from "@game/lib/constants/common";

export const asteroidSceneConfig: SceneConfig = {
  key: Scenes.Asteroid,
  camera: {
    minZoom: 1,
    maxZoom: 5,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 3,
  },
  animations: AnimationConfig,
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
