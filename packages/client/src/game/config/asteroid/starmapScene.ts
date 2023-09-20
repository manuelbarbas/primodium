// import { SceneConfig } from "../../types";
import { SceneConfig, TilesetConfig } from "engine/types";
import { animationConfig } from "./animation";
import { tileAnimationConfig } from "./tileAnimation";
import asteroidMap from "../../../maps/asteroid_0.7.json";
import { LayerConfig } from "engine/lib/core/tilemap/types";
import { Assets, Tilesets } from "@game/constants";

const tilesets: TilesetConfig = {};
const tilesetNames = [];
const layers: LayerConfig<any, any> = {};

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
    hasLightShader: false,
  };
}

export const beltSceneConfig: SceneConfig = {
  key: "Belt",
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
    chunkSize: 64,
    tilesets: {
      ...tilesets,
      [Tilesets.Resource]: {
        key: Assets.ResourceTileset,
        tileHeight: 32,
        tileWidth: 32,
      },
    },
    layerConfig: {
      layers: {
        ...layers,
        Resource: {
          tilesets: [Tilesets.Resource],
          hasHueTintShader: false,
        },
      },
      defaultLayer: "Base",
    },
    tileAnimations: tileAnimationConfig,
    animationInterval: 200,
  },
};
