import { SceneConfig } from "engine/types";
import { Scenes } from "../constants/common";

export const commandCenterScene: SceneConfig = {
  key: Scenes.CommandCenter,
  camera: {
    minZoom: 0.15,
    maxZoom: 3,
    defaultZoom: 3,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128,
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
  },
};
