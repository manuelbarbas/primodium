import { SceneConfig } from "../../util/types";
import { Scenes } from "../constants";

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  assetPackUrl: "assets/pack",
  tilemap: {
    tileWidth: 16,
    tileHeight: 16,
    chunkSize: 32,
  },
  camera: {
    minZoom: 2,
    maxZoom: 5,
    defaultZoom: 2,
    pinchSpeed: 1,
    scrollSpeed: 0.5,
  },
};

export default mainSceneConfig;
