// import { SceneConfig } from "../../types";
import { SceneConfig, TilesetConfig } from "engine/types";
import { AsteroidMap } from "../../constants";
import { animationConfig } from "./animation";
import { tileAnimationConfig } from "./tileAnimation";
import asteroidMap from "../../../maps/asteroid_0.7.json";
import { LayerConfig } from "@latticexyz/phaserx/dist/types";

const { Scenes } = AsteroidMap;

let tilesets: TilesetConfig = {};
let tilesetNames = [];
let layers: LayerConfig<any, any> = {};

for (const tileset of asteroidMap.tilesets) {
  tilesets[tileset.name] = {
    key: tileset.name,
    tileHeight: tileset.tileheight,
    tileWidth: tileset.tilewidth,
    extrusion: 1,
    gid: tileset.firstgid,
  };

  tilesetNames.push(tileset.name);
}

for (const layer of asteroidMap.layers) {
  layers[layer.name] = {
    tilesets: tilesetNames,
    hasHueTintShader: false,
  };
}

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  camera: {
    minZoom: Math.max(1, window.devicePixelRatio),
    maxZoom: window.devicePixelRatio * 5,
    defaultZoom: window.devicePixelRatio * 1,
    pinchSpeed: 0.01,
    wheelSpeed: 3,
  },
  animations: animationConfig,
  cullingChunkSize: 64,
  tilemap: {
    tileWidth: asteroidMap.tilewidth,
    tileHeight: asteroidMap.tileheight,
    chunkSize: 32,
    tilesets: {
      ...tilesets,
    },
    layerConfig: {
      layers: { ...layers },
      defaultLayer: "Base",
    },
    tileAnimations: tileAnimationConfig,
    animationInterval: 200,
  },
};

export default mainSceneConfig;
