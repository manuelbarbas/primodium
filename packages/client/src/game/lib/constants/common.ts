export const ASSET_PACK = "/assets/pack.json";
export const KEY = "MAIN";

export const _Scenes = ["ROOT", "MAIN", "STARMAP", "UI"] as const;
export type SceneKeys = (typeof _Scenes)[number];

export const DepthLayers = {
  Rock: 100,
  Resources: 200,
  Bounds: 250,
  Tile: 300,
  Building: 400,
  Path: 500,
  Marker: 600,
} as const;

export const asteroidRelationsips = ["Neutral", "Ally", "Enemy", "Self"] as const;
export type AsteroidRelationship = (typeof asteroidRelationsips)[number];

export const asteroidSizes = ["Micro", "Small", "Medium", "Large"] as const;
export type AsteroidSize = (typeof asteroidSizes)[number];
