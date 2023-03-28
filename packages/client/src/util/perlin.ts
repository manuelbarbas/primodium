import { Perlin } from "@latticexyz/noise";
import { Coord } from "../util/types";

export function getSingleDepth(
  coord: Coord,
  perlin: Perlin,
  perlinSeed: number,
  denom: number
) {
  const depth = perlin(coord.x + perlinSeed, coord.y + perlinSeed, 0, denom);
  return depth;
}

export function getTerrainDepth(coord: Coord, perlin: Perlin) {
  const terrainDepth = getSingleDepth(coord, perlin, 0, 8);
  return terrainDepth;
}
