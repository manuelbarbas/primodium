import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { key } from "./constants";

export function outOfBounds(coord: Coord, asteroid: Entity) {
  const bounds = getAsteroidBounds(asteroid);
  return coord.x > bounds.maxX || coord.x < bounds.minX || coord.y > bounds.maxY || coord.y < bounds.minY;
}

export function getAsteroidBounds(asteroid: Entity, next?: boolean) {
  const level = components.Level.get(asteroid as Entity, { value: 1n }).value;
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

export function getAsteroidMaxBounds(asteroid: Entity) {
  const asteroidMaxLevel = components.Asteroid.get(asteroid)?.maxLevel ?? 1n;
  console.log("max level", asteroidMaxLevel);
  const asteroidDims = components.P_Asteroid.get();
  console.log("asteroid dims", asteroidDims);
  const dimensions = components.Dimensions.getWithKeys({ key: key.ExpansionKey, level: asteroidMaxLevel });
  console.log("dimensions", dimensions);
  if (!asteroidDims || !dimensions) throw new Error("Asteroid dimensions or range not found");
  if (asteroidDims.xBounds === dimensions.width && asteroidDims.yBounds === dimensions.height)
    return {
      minX: 0,
      minY: 0,
      maxX: dimensions.width,
      maxY: dimensions.height,
    };
  return {
    minX: Math.floor(asteroidDims.xBounds - dimensions.width) / 2,
    minY: Math.floor(asteroidDims.yBounds - dimensions.height) / 2,
    maxX: Math.floor(asteroidDims.xBounds + dimensions.width) / 2 - 1,
    maxY: Math.floor(asteroidDims.yBounds + dimensions.height) / 2 - 1,
  };
}
