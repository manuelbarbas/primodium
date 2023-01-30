import { Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockKey } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed1 = 60194;
const perlinSeed2 = 74037;
const perlinSeed3 = 53092;
const perlinSeed4 = 17326;
const perlinSeed5 = 43875;

export function getTerrainDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number
) {
  const denom = 8;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

export function getTerrainNormalizedDepth(coord: Coord, perlin: Perlin) {
  const depth1 = getTerrainDepth(coord, perlin, perlinSeed1);
  const depth2 = getTerrainDepth(coord, perlin, perlinSeed2);
  const depth3 = getTerrainDepth(coord, perlin, perlinSeed3);
  const depth4 = getTerrainDepth(coord, perlin, perlinSeed4);
  const depth5 = getTerrainDepth(coord, perlin, perlinSeed5);

  const normalizedDepth = ((depth1 + depth2 + depth3) / 3) * 100;

  return normalizedDepth;
}

export function getTerrainKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getTerrainNormalizedDepth(coord, perlin);

  if (normalizedDepth < 35) return BlockKey.Water;
  if (normalizedDepth < 42) return BlockKey.Sandstone;
  if (normalizedDepth < 48) return BlockKey.Alluvium;
  if (normalizedDepth < 53) return BlockKey.Biofilm;
  if (normalizedDepth < 54) return BlockKey.Teranomite;
  if (normalizedDepth < 55) return BlockKey.Titanium;
  if (normalizedDepth < 69) return BlockKey.Regolith;
  if (normalizedDepth < 70) return BlockKey.Kyronium;
  return BlockKey.Regolith;
}
