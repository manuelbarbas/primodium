import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Dimensions, Level } from "src/network/components/chainComponents";
import { hashStringEntity, trim } from "./encode";

export function outOfBounds(coord: Coord, player?: EntityID) {
  const bounds = player ? getPlayerBounds(player) : getAsteroidBounds();
  return (
    coord.x > bounds.maxX ||
    coord.x < bounds.minX ||
    coord.y > bounds.maxY ||
    coord.y < bounds.minY
  );
}

export function getPlayerBounds(player: EntityID) {
  const level = Level.get(player, { value: 1 }).value;
  const researchLevelEntity = trim(
    hashStringEntity("research.Expansion", level)
  );

  const asteroidDims = Dimensions.get();
  const range = Dimensions.get(researchLevelEntity);
  if (!asteroidDims || !range)
    throw new Error("Asteroid dimensions or range not found");
  return {
    minX: Math.floor(asteroidDims.width - range.width) / 2,
    minY: Math.floor(asteroidDims.height - range.height) / 2,
    maxX: Math.floor(asteroidDims.width + range.width) / 2 - 1,
    maxY: Math.floor(asteroidDims.height + range.height) / 2 - 1,
  };
}

export function getAsteroidBounds() {
  const asteroidDims = Dimensions.get();
  if (!asteroidDims) throw new Error("Asteroid dimensions not found");
  return {
    minX: 0,
    minY: 0,
    maxX: asteroidDims?.width,
    maxY: asteroidDims?.height,
  };
}
