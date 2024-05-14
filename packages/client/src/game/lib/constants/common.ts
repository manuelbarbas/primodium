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
  Rock: 100,
  Resources: 200,
  Bounds: 250,
  Tile: 300,
  Building: 400,
  Path: 500,
  Marker: 600,
} as const;

export const relationships = ["Neutral", "Ally", "Enemy", "Self"] as const;
export type Relationship = (typeof relationships)[number];

export const asteroidSizes = ["Micro", "Small", "Medium", "Large"] as const;
export type AsteroidSize = (typeof asteroidSizes)[number];
