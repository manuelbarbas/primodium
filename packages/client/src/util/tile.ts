import { Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType, BlockColors } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed = 413;

export function getTerrainDepth(coord: Coord, perlin: Perlin) {
  const denom = 50;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

export function getTerrainTile(coord: Coord, perlin: Perlin) {
  const depth = getTerrainDepth(coord, perlin);
  const normalizedDepth = depth * 100;
  if (normalizedDepth < 40) return BlockType.Alluvium;
  if (normalizedDepth < 45) return BlockType.Regolith;
  if (normalizedDepth < 50) return BlockType.Regolith;
  if (normalizedDepth < 45) return BlockType.Lithium;
  return BlockType.Water;
}

export function getTerrainColor(coord: Coord, perlin: Perlin) {
  const depth = getTerrainDepth(coord, perlin);
  const normalizedDepth = depth * 100;
  if (normalizedDepth < 40) return BlockColors.Alluvium;
  if (normalizedDepth < 45) return BlockColors.Regolith;
  if (normalizedDepth < 50) return BlockColors.Regolith;
  if (normalizedDepth < 55) return BlockColors.Lithium;
  return BlockColors.Water;
}

export async function createUtilities() {
  return {
    getTerrainTile,
  };
}
