// import { SceneConfig } from "../../types";
import { SceneConfig } from "engine/types";
import { Scenes } from "../constants";
import { animationConfig } from "./animation";
import asteroidMap from "../../maps/asteroid_0.7.json";

export const asteroidSceneConfig: SceneConfig = {
  key: Scenes.Asteroid,
  camera: {
    minZoom: 1,
    maxZoom: 5,
    defaultZoom: 1,
    pinchSpeed: 0.01,
    wheelSpeed: 3,
  },
  animations: animationConfig,
  cullingChunkSize: 64,
  tilemap: {
    tileWidth: asteroidMap.tilewidth,
    tileHeight: asteroidMap.tileheight,
  },
};
