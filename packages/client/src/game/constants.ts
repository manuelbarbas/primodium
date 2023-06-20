import { BlockType } from "../util/constants";

export enum Scenes {
  Main = "Main",
}

export const TILE_HEIGHT = 16;
export const TILE_WIDTH = 16;
export const RENDER_INTERVAL = 30;
export const ANIMATION_INTERVAL = 200;

export enum Assets {
  TerrainTileset = "TerrainTileset",
  ResourceTileset = "ResourceTileset",
}

export enum GameStatus {
  Loading,
  Ready,
  Error,
}

export enum TileAnimationKey {}
export const TileAnimations: { [key in TileAnimationKey]: number[] } = {};

export enum Maps {
  Main = "Main",
}

export enum TerrainTileset {
  Air,
  Alluvium,
  Bedrock,
  Biofilm,
  Regolith,
  Sandstone,
  Water,
}

export enum ResourceTileset {
  Bolutite,
  Copper,
  Iridium,
  Iron,
  Kimberlite,
  Lithium,
  Osmium,
  Titanium,
  Tungsten,
  Uraninite,
}

export enum KeyindActions {
  Up,
  Down,
  Left,
  Right,
  Center,
  Base,
  Hotbar1,
  Hotbar2,
  Hotbar3,
  Hotbar4,
  Hotbar5,
  Hotbar6,
  Hotbar7,
  Hotbar8,
  Hotbar9,
  Hotbar0,
  Marker1,
  Marker2,
  Marker3,
  Marker4,
  ZoomIn,
  ZoomOut,
  RightClick,
  LeftClick,
  BuildMenu,
  AttackMenu,
  InventoryMenu,
  Mute,
  MainMenu,
  Debug,
  DeleteBuilding,
  DeletePath,
}

export const Tileset = { ...TerrainTileset, ...ResourceTileset };

export const EntityIdtoTilesetId = {
  [BlockType.Air]: Tileset.Air,
  [BlockType.Iron]: Tileset.Iron,
  [BlockType.Biofilm]: Tileset.Biofilm,
  [BlockType.Sandstone]: Tileset.Sandstone,
  [BlockType.Water]: Tileset.Water,
  [BlockType.Bedrock]: Tileset.Bedrock,
  [BlockType.Regolith]: Tileset.Regolith,
  [BlockType.Copper]: Tileset.Copper,
  [BlockType.Lithium]: Tileset.Lithium,
  [BlockType.Titanium]: Tileset.Titanium,
  [BlockType.Osmium]: Tileset.Osmium,
  [BlockType.Tungsten]: Tileset.Tungsten,
  [BlockType.Iridium]: Tileset.Iridium,
  [BlockType.Kimberlite]: Tileset.Kimberlite,
  [BlockType.Uraninite]: Tileset.Uraninite,
  [BlockType.Bolutite]: Tileset.Bolutite,
};
