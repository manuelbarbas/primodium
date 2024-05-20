export enum Tilesets {
  Resource = "resource",
  BoundsOuterBorder = "bounds-outerborder",
  BoundsInnerBorder = "bounds-innerborder",
  BoundsNonBuildable = "bounds-nonbuildable",
}

export type TilesetKeys = keyof typeof Tilesets;

export enum Tilemaps {
  AsteroidMicro = "asteroid-micro",
  AsteroidSmall = "asteroid-small",
  AsteroidMedium = "asteroid-medium",
  AsteroidLarge = "asteroid-large",
}

export type TilemapKeys = keyof typeof Tilemaps;

export enum ResourceTilekeys {
  Copper = 1,
  Iron,
  Lithium,
  Sulfur,
  Titanium,
  Kimberlite,
  Iridium,
  Platinum,
}
