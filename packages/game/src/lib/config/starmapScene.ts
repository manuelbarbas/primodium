import { SceneConfig } from "@primodiumxyz/engine/types";
import { Scenes } from "@game/lib/constants/common";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.Starmap,
  camera: {
    minZoom: 0.07,
    maxZoom: 1.5,
    defaultZoom: 0.75,
    pinchSpeed: 0.01,
    wheelSpeed: 2,
  },
  cullingChunkSize: 512,
  tilemap: {
    tileWidth: 84,
    tileHeight: 64,
  },
};
