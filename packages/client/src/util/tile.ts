import { Perlin } from "@latticexyz/noise";
import { Coord } from "../util/types";
import { BlockType, DisplayKeyPair } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed1 = 60194;
const perlinSeed2 = 74037;
const perlinSeed3 = 53092;
const perlinSeed4 = 17326;

export function getSingleDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number,
  denom: number
) {
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

//landscape blocks terrain generation
export function getTerrainNormalizedDepth(coord: Coord, perlin: Perlin) {
  const denom = 12;
  const depth1 = getSingleDepth(coord, perlin, perlinSeed1, denom);
  const depth2 = getSingleDepth(coord, perlin, perlinSeed2, denom);
  const depth3 = getSingleDepth(coord, perlin, perlinSeed3, denom);
  const depth4 = getSingleDepth(coord, perlin, perlinSeed4, denom);

  const normalizedDepth = ((depth1 + depth2 + depth3 + depth4) / 5) * 100;
  return Math.floor(normalizedDepth);
}

export function getTerrainKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getTerrainNormalizedDepth(coord, perlin);
  if (normalizedDepth <= 29) return BlockType.Water;
  if (normalizedDepth <= 32) return BlockType.Biofilm;
  if (normalizedDepth <= 35) return BlockType.Alluvium;
  if (normalizedDepth <= 39) return BlockType.Sandstone;
  if (normalizedDepth <= 48) return BlockType.Regolith;
  if (normalizedDepth <= 51) return BlockType.Bedrock;

  return BlockType.Bedrock;
}

//resource blocks terrain gen
export function getResourceNormalizedDepth(coord: Coord, perlin: Perlin) {
  const denom = 8;
  const depth1 = getSingleDepth(coord, perlin, perlinSeed1, denom);
  const depth2 = getSingleDepth(coord, perlin, perlinSeed2, denom);

  const normalizedDepth = ((depth1 + depth2) / 4) * 10000;
  return Math.floor(normalizedDepth);
}

export function getResourceKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getResourceNormalizedDepth(coord, perlin);
  //base starting materials (most common)
  if (normalizedDepth >= 1800 && normalizedDepth <= 1820)
    return BlockType.Copper;
  if (normalizedDepth >= 2000 && normalizedDepth <= 2006)
    return BlockType.Lithium;
  if (normalizedDepth >= 2400 && normalizedDepth <= 2418) return BlockType.Iron;

  //mid game items
  if (normalizedDepth <= 1350) return BlockType.Titanium;
  if (normalizedDepth >= 2600 && normalizedDepth <= 2602)
    return BlockType.Iridium;
  if (normalizedDepth >= 3095 && normalizedDepth <= 3100)
    return BlockType.Osmium;
  if (normalizedDepth >= 3400 && normalizedDepth <= 3430)
    return BlockType.Tungsten;

  //late game (rarer) items
  if (normalizedDepth >= 2720 && normalizedDepth <= 2721)
    return BlockType.Kimberlite;
  if (normalizedDepth >= 3220 && normalizedDepth <= 3222)
    return BlockType.Uraninite;
  if (normalizedDepth >= 3620 && normalizedDepth <= 3622)
    return BlockType.Bolutite;

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

export function getTopLayerKeyPair(
  coord: Coord,
  perlin: Perlin
): DisplayKeyPair {
  const terrainKey = getTerrainKey(coord, perlin);
  const resourceKey = getResourceKey(coord, perlin);

  if (resourceKey === BlockType.Air || terrainKey === BlockType.Water) {
    return { terrain: terrainKey, resource: null };
  } else {
    return { terrain: terrainKey, resource: resourceKey };
  }
}
