import { Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType, BlockColors } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed = 69420;

export function getTerrainDepth(coord: Coord, perlin: Perlin) {
  const denom = 8;
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
  if (normalizedDepth < 35) return BlockColors.Water;
  if (normalizedDepth < 42) return BlockColors.Sandstone;
  if (normalizedDepth < 48) return BlockColors.Alluvium;
  if (normalizedDepth < 53) return BlockColors.Biofilm;
  if (normalizedDepth < 54) return BlockColors.Teranomite;
  if (normalizedDepth < 55) return BlockColors.Titanium;
  if (normalizedDepth < 69) return BlockColors.Regolith;
  if (normalizedDepth < 70) return BlockColors.Kyronium;
  return BlockColors.Regolith;
}

export async function createUtilities() {
  return {
    getTerrainTile,
  };
}
