import { SceneConfig } from "engine/types";
import { Scenes } from "../constants/common";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.Starmap,
  camera: {
    minZoom: 0.1,
    maxZoom: 3,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128 * 2,
  tilemap: {
    tileWidth: 84,
    tileHeight: 64,
  },
};
