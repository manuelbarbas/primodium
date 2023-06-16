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
