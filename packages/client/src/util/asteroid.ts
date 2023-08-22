import { HasValue, runQuery } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";

export function getAsteroidEntityAtCoord(coord: Coord) {
  const entities = runQuery([HasValue(Position, coord)]);

  if (!entities.size) return undefined;

  return world.entities[entities.values().next().value];
}
