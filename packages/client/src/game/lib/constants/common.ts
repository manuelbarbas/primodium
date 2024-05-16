export const ASSET_PACK = "/assets/pack.json";
export const KEY = "MAIN";

export const Scenes = {
  Root: "ROOT",
  Asteroid: "ASTEROID",
  Starmap: "STARMAP",
  UI: "UI",
  CommandCenter: "COMMAND_CENTER",
} as const;

export type SceneKeys = (typeof Scenes)[keyof typeof Scenes];

export const DepthLayers = {
  Rock: 1000,
  Resources: 2000,
  Bounds: 2500,
  Tile: 3000,
  Building: 4000,
  Path: 5000,
  Marker: 6000,
} as const;

export const asteroidRelationsips = ["Neutral", "Ally", "Enemy", "Self"] as const;
export type AsteroidRelationship = (typeof asteroidRelationsips)[number];

export const asteroidSizes = ["Micro", "Small", "Medium", "Large"] as const;
export type AsteroidSize = (typeof asteroidSizes)[number];
