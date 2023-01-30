import { createPerlin, Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed = 413;

export function getTerrainDepth(coord: Coord, perlin: Perlin) {
  const denom = 128;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

export function getTerrainTile(coord: Coord, perlin: Perlin) {
  const depth = getTerrainDepth(coord, perlin);
  if (depth < 32) return BlockType.Alluvium;
  if (depth < 16) return BlockType.Regolith;
  if (depth < 8) return BlockType.Regolith;
  if (depth < 4) return BlockType.Lithium;
  return BlockType.Water;
}

export async function createUtilities() {
  const perlin = await createPerlin();
  return {
    getTerrainTile,
  };
}
