import { SceneConfig } from "engine/types";
import { Scenes } from "../constants/common";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.Starmap,
  camera: {
    minZoom: 0.15,
    maxZoom: 3,
    defaultZoom: 0.15,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128 * 2,
  tilemap: {
    tileWidth: 84,
    tileHeight: 64,
  },
};
