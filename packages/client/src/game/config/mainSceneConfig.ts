import { SceneConfig } from "../../util/types";
import { Scenes } from "../constants";
import animationConfig from "./animationConfig";
import tileAnimationConfig from "./tileAnimationConfig";

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
    dragSpeed: 2,
  },
  animations: animationConfig,
  tileAnimations: tileAnimationConfig,
  animationInterval: 100,
  cullingChunkSize: 32,
};

export default mainSceneConfig;
