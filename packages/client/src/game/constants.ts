import { BlockType } from "../util/constants";

export enum Scenes {
  Main = "Main",
}

export const TILE_HEIGHT = 16;
export const TILE_WIDTH = 16;
export const RENDER_INTERVAL = 30;
export const ANIMATION_INTERVAL = 200;

export enum Assets {
  Pack = "assets/pack",
  SpriteAtlas = "sprite-atlas",
  ResourceTileset = "resource-tileset",
  TerrainTileset = "terrain-tileset",
}

export enum GameStatus {
  Loading,
  Ready,
  Error,
}

export enum Maps {
  Main = "Main",
}

export enum TerrainTilekeys {
  Air,
  Alluvium,
  Bedrock,
  Biofilm,
  Regolith,
  Sandstone,
  Water,
}

export enum ResourceTilekeys {
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

export const Tilekeys = { ...TerrainTilekeys, ...ResourceTilekeys };

export enum TileAnimationKeys {
  Water = "Water",
}

export enum AnimationKeys {
  Mainbase = "Mainbase",
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

export const EntityIdtoTilesetId = {
  [BlockType.Air]: Tilekeys.Air,
  [BlockType.Iron]: Tilekeys.Iron,
  [BlockType.Biofilm]: Tilekeys.Biofilm,
  [BlockType.Sandstone]: Tilekeys.Sandstone,
  [BlockType.Water]: Tilekeys.Water,
  [BlockType.Bedrock]: Tilekeys.Bedrock,
  [BlockType.Regolith]: Tilekeys.Regolith,
  [BlockType.Copper]: Tilekeys.Copper,
  [BlockType.Lithium]: Tilekeys.Lithium,
  [BlockType.Titanium]: Tilekeys.Titanium,
  [BlockType.Osmium]: Tilekeys.Osmium,
  [BlockType.Tungsten]: Tilekeys.Tungsten,
  [BlockType.Iridium]: Tilekeys.Iridium,
  [BlockType.Kimberlite]: Tilekeys.Kimberlite,
  [BlockType.Uraninite]: Tilekeys.Uraninite,
  [BlockType.Bolutite]: Tilekeys.Bolutite,
};
