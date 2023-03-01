import { Perlin } from "@latticexyz/noise";
import { Coord } from "@latticexyz/utils";
import { BlockType } from "./constants";

// TODO: randomize perlinSeed
const perlinSeed1 = 60194;
const perlinSeed2 = 74037;
const perlinSeed3 = 53092;
const perlinSeed4 = 17326;

export function getSingleTerrainDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number
) {
  const denom = 12;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 1, denom);
  return depth;
}

export function getSingleResourceDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number
) {
  const denom = 8;
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 1, denom);
  return depth;
}

//landscape blocks terrain generation
export function getTerrainNormalizedDepth(coord: Coord, perlin: Perlin) {
  const depth1 = getSingleTerrainDepth(coord, perlin, perlinSeed1);
  const depth2 = getSingleTerrainDepth(coord, perlin, perlinSeed2);
  const depth3 = getSingleTerrainDepth(coord, perlin, perlinSeed3);
  const depth4 = getSingleTerrainDepth(coord, perlin, perlinSeed4);

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
  const depth1 = getSingleResourceDepth(coord, perlin, perlinSeed1);
  const depth2 = getSingleResourceDepth(coord, perlin, perlinSeed2);

  const normalizedDepth = ((depth1 + depth2) / 4) * 10000;

  return normalizedDepth;
}

export function getResourceKey(coord: Coord, perlin: Perlin) {
  const normalizedDepth = getResourceNormalizedDepth(coord, perlin);
  //base starting materials (most common)
  if (normalizedDepth > 1800 && normalizedDepth < 1820) return BlockType.Copper;
  if (normalizedDepth > 2000 && normalizedDepth < 2006)
    return BlockType.Lithium;
  if (normalizedDepth > 2400 && normalizedDepth < 2418) return BlockType.Iron;

  //mid game items
  if (normalizedDepth < 1350) return BlockType.Titanium;
  if (normalizedDepth > 2600 && normalizedDepth < 2602)
    return BlockType.Iridium;
  if (normalizedDepth > 3095 && normalizedDepth < 3100) return BlockType.Osmium;
  if (normalizedDepth > 3400 && normalizedDepth < 3430)
    return BlockType.Tungsten;

  //late game (rarer) items
  if (normalizedDepth > 2720 && normalizedDepth < 2721)
    return BlockType.Kimberlite;
  if (normalizedDepth > 3220 && normalizedDepth < 3222)
    return BlockType.Uraninite;
  if (normalizedDepth > 3620 && normalizedDepth < 3622)
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
