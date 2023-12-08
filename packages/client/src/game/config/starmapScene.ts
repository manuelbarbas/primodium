// import { SceneConfig } from "../../types";
import { Scenes } from "@game/constants";
import { SceneConfig } from "engine/types";

export const starmapSceneConfig: SceneConfig = {
  key: Scenes.Starmap,
  camera: {
    minZoom: 0.75,
    maxZoom: 2,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 1,
  },
  cullingChunkSize: 128,
  tilemap: {
    tileWidth: 12,
    tileHeight: 12,
    chunkSize: 128,
  },
};
