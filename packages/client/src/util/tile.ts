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
  const depth5 = getTerrainDepth(coord, perlin, perlinSeed5);

  const normalizedDepth = ((depth1 + depth2 + depth3 + depth4) / 5) * 100;

  return normalizedDepth;
}

export function getTerrainKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getTerrainNormalizedDepth(coord, perlin);
  if (normalizedDepth < 29) return BlockKey.Water;
  if (normalizedDepth < 32) return BlockKey.Biofilm;
  if (normalizedDepth < 35) return BlockKey.Alluvium;
  if (normalizedDepth < 39) return BlockKey.Sandstone;
  if (normalizedDepth < 48) return BlockKey.Regolith;
  if (normalizedDepth < 51) return BlockKey.Bedrock;

  return BlockKey.Bedrock;
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
  if (normalizedDepth > 18 && normalizedDepth < 18.2) return BlockKey.Copper;
  if (normalizedDepth > 20 && normalizedDepth < 20.06) return BlockKey.Lithium;
  if (normalizedDepth > 24 && normalizedDepth < 24.18) return BlockKey.Iron;

  //mid game items
  if (normalizedDepth < 13.5) return BlockKey.Titanium;
  if (normalizedDepth > 26 && normalizedDepth < 26.02) return BlockKey.Iridium;
  if (normalizedDepth > 30.95 && normalizedDepth < 31) return BlockKey.Osmium;
  if (normalizedDepth > 34 && normalizedDepth < 34.3) return BlockKey.Tungsten;

  //late game (rarer) items
  if (normalizedDepth > 27.2 && normalizedDepth < 27.21) return BlockKey.Kimberlite;
  if (normalizedDepth > 32.2 && normalizedDepth < 32.22) return BlockKey.Uraninite;
  if (normalizedDepth > 36.2 && normalizedDepth < 36.22) return BlockKey.Bolutite;


  return BlockKey.Air;
}

export function getTopLayerKey(coord: Coord, perlin: Perlin) {
  const terrainKey = getTerrainKey(coord, perlin);
  const resourceKey = getResourceKey(coord, perlin);

  if (resourceKey === BlockKey.Air || terrainKey === BlockKey.Water) {
    return terrainKey;
  } else {
    return resourceKey;
  }
}
