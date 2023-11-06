import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { key } from "./constants";

export function outOfBounds(coord: Coord, player?: Entity) {
  const bounds = player ? getPlayerBounds(player) : getAsteroidBounds();
  return coord.x > bounds.maxX || coord.x < bounds.minX || coord.y > bounds.maxY || coord.y < bounds.minY;
}

export function getPlayerBounds(player: Entity, next?: boolean) {
  const level = components.Level.get(player, { value: 1n }).value;

  const asteroidDims = components.P_Asteroid.get();
  const range = components.Dimensions.getWithKeys({ key: key.ExpansionKey, level: level + (next ? 1n : 0n) });
  if (!asteroidDims || !range) throw new Error("Asteroid dimensions or range not found");
  return {
    minX: Math.floor(asteroidDims.xBounds - range.width) / 2,
    minY: Math.floor(asteroidDims.yBounds - range.height) / 2,
    maxX: Math.floor(asteroidDims.xBounds + range.width) / 2 - 1,
    maxY: Math.floor(asteroidDims.yBounds + range.height) / 2 - 1,
  };
}

export function getAsteroidBounds() {
  const asteroidDims = components.P_Asteroid.get();
  if (!asteroidDims) throw new Error("Asteroid dimensions not found");
  return {
    minX: 0,
    minY: 0,
    maxX: asteroidDims?.xBounds,
    maxY: asteroidDims?.yBounds,
  };
}
