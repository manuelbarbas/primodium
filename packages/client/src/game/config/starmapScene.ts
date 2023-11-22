// import { SceneConfig } from "../../types";
import { Scenes } from "@game/constants";
import { SceneConfig } from "engine/types";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.Starmap,
  camera: {
    minZoom: 0.1,
    maxZoom: 1,
    defaultZoom: 0.5,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128,
  tilemap: {
    tileWidth: 36,
    tileHeight: 36,
    chunkSize: 128,
  },
};
