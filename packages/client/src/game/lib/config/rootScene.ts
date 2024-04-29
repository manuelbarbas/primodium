import { SceneConfig } from "engine/types";
import { Scenes } from "../constants/common";

export const rootSceneConfig: SceneConfig = {
  key: Scenes.Root,
  camera: {
    minZoom: 1,
    maxZoom: 1,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128,
  tilemap: {
    tileWidth: 1,
    tileHeight: 1,
  },
};
