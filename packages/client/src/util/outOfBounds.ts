import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Dimensions, Level } from "src/network/components/chainComponents";
import { hashStringEntity, trim } from "./encode";

export function outOfBounds(player: EntityID, coord: Coord) {
  const bounds = getPlayerBounds(player);
  return (
    coord.x > bounds.maxX ||
    coord.x < bounds.minX ||
    coord.y > bounds.maxY ||
    coord.y < bounds.minY
  );
}

export function getPlayerBounds(player: EntityID) {
  const level = Level.get(player, { value: 1 }).value;
  console.log("player level:", level);
  const researchLevelEntity = trim(
    hashStringEntity("research.Expansion", level)
  );

  const asteroidDims = Dimensions.get();
  const range = Dimensions.get(researchLevelEntity);
  console.log("range:", range);
  if (!asteroidDims || !range)
    throw new Error("Asteroid dimensions or range not found");
  return {
    minX: Math.floor(asteroidDims.width - range.width) / 2,
    minY: Math.floor(asteroidDims.height - range.height) / 2,
    maxX: Math.floor(asteroidDims.width + range.width) / 2 - 1,
    maxY: Math.floor(asteroidDims.height + range.height) / 2 - 1,
  };
}
