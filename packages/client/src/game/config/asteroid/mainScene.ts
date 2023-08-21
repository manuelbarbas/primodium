// import { SceneConfig } from "../../types";
import { SceneConfig, TilesetConfig } from "engine/types";
import { AsteroidMap } from "../../constants";
import { animationConfig } from "./animation";
import { tileAnimationConfig } from "./tileAnimation";
import asteroidMap from "../../../maps/asteroid_0.7.json";
import { LayerConfig } from "engine/lib/core/tilemap/types";

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
    depth: layer.properties ? layer.properties[0].value : 0,
    hasHueTintShader: false,
    hasLightShader: true,
  };
}

const mainSceneConfig: SceneConfig = {
  key: Scenes.Main,
  camera: {
    minZoom: Math.max(1, window.devicePixelRatio),
    maxZoom: window.devicePixelRatio * 5,
    defaultZoom: window.devicePixelRatio,
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
      [AsteroidMap.Tilesets.Resource]: {
        key: AsteroidMap.Assets.ResourceTileset,
        tileHeight: 32,
        tileWidth: 32,
      },
    },
    layerConfig: {
      layers: {
        ...layers,
        Resource: {
          tilesets: [AsteroidMap.Tilesets.Resource],
          hasHueTintShader: false,
        },
      },
      defaultLayer: "Base",
    },
    tileAnimations: tileAnimationConfig,
    animationInterval: 200,
  },
};

export default mainSceneConfig;
