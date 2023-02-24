import { Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed1 = 60194;
const perlinSeed2 = 74037;
const perlinSeed3 = 53092;
const perlinSeed4 = 17326;

export function getTerrainDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number
) {
  const denom = 12;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

export function getResourceDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number
) {
  const denom = 8;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

//landscape blocks terrain generation
export function getTerrainNormalizedDepth(coord: Coord, perlin: Perlin) {
  const depth1 = getTerrainDepth(coord, perlin, perlinSeed1);
  const depth2 = getTerrainDepth(coord, perlin, perlinSeed2);
  const depth3 = getTerrainDepth(coord, perlin, perlinSeed3);
  const depth4 = getTerrainDepth(coord, perlin, perlinSeed4);

  const normalizedDepth = ((depth1 + depth2 + depth3 + depth4) / 5) * 100;

  return normalizedDepth;
}

export function getTerrainKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getTerrainNormalizedDepth(coord, perlin);
  if (normalizedDepth < 29) return BlockType.Water;
  if (normalizedDepth < 32) return BlockType.Biofilm;
  if (normalizedDepth < 35) return BlockType.Alluvium;
  if (normalizedDepth < 39) return BlockType.Sandstone;
  if (normalizedDepth < 48) return BlockType.Regolith;
  if (normalizedDepth < 51) return BlockType.Bedrock;

  return BlockType.Bedrock;
}

//resource blocks terrain gen
export function getResourceNormalizedDepth(coord: Coord, perlin: Perlin) {
  const depth1 = getResourceDepth(coord, perlin, perlinSeed1);
  const depth2 = getResourceDepth(coord, perlin, perlinSeed2);

  const normalizedDepth = ((depth1 + depth2) / 4) * 100;

  return normalizedDepth;
}

export function getResourceKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getResourceNormalizedDepth(coord, perlin);
  //base starting materials (most common)
  if (normalizedDepth > 18 && normalizedDepth < 19) return BlockType.Copper;
  if (normalizedDepth > 20 && normalizedDepth < 21) return BlockType.Lithium;
  if (normalizedDepth > 24 && normalizedDepth < 25) return BlockType.Iron;

  //mid game items
  if (normalizedDepth < 14) return BlockType.Titanium;
  if (normalizedDepth > 26 && normalizedDepth < 27) return BlockType.Iridium;
  if (normalizedDepth > 30 && normalizedDepth < 31) return BlockType.Osmium;
  if (normalizedDepth > 34 && normalizedDepth < 34) return BlockType.Tungsten;

  //late game (rarer) items
  if (normalizedDepth > 27 && normalizedDepth < 26) return BlockType.Kimberlite;
  if (normalizedDepth > 32 && normalizedDepth < 32) return BlockType.Uraninite;
  if (normalizedDepth > 36 && normalizedDepth < 37) return BlockType.Bolutite;

  return BlockType.Air;
}

export function getTopLayerKey(coord: Coord, perlin: Perlin) {
  const terrainKey = getTerrainKey(coord, perlin);
  const resourceKey = getResourceKey(coord, perlin);

  if (resourceKey === BlockType.Air || terrainKey === BlockType.Water) {
    return terrainKey;
  } else {
    return resourceKey;
  }
}
