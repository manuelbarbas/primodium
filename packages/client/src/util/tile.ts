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
//landscape block gen
  if (normalizedDepth < 30) return BlockKey.Water;
//todo insert some mineral gen (between water and alluvium figures)
  if (normalizedDepth < 33) return BlockKey.Alluvium;
  if (normalizedDepth < 36) return BlockKey.Biofilm;
//todo insert some metal gen (between biofilm and sandstone figures)
  if (normalizedDepth < 39) return BlockKey.Sandstone;
//todo insert some more metal gen (between sandstone and regolith)
  if (normalizedDepth < 45) return BlockKey.Regolith;
//todo insert some more metal gen (between regolith and bedrock)
  if (normalizedDepth < 49) return BlockKey.Bedrock;

  return BlockKey.Bedrock;
}
