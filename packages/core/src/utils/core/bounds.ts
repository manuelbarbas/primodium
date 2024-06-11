import { Entity } from "@primodiumxyz/reactive-tables";
import { Keys } from "@/lib/constants";
import { Tables, Coord, Dimensions } from "@/lib/types";

export function createBoundsUtils(tables: Tables) {
  /**
   * Checks if coord is out of bounds of asteroid
   * @param coord  coord to check
   * @param asteroid  asteroid entity
   */
  function outOfBounds(coord: Coord, asteroid: Entity): boolean {
    const bounds = getAsteroidBounds(asteroid);
    return coord.x >= bounds.maxX || coord.x < bounds.minX || coord.y >= bounds.maxY || coord.y < bounds.minY;
  }

  /**
   * Checks if coord is out of max bounds of asteroid
   * @param coord coord to check
   * @param asteroid asteroid entity
   */
  function outOfMaxBounds(coord: Coord, asteroid: Entity): boolean {
    const bounds = getAsteroidMaxBounds(asteroid);
    return coord.x >= bounds.maxX || coord.x < bounds.minX || coord.y >= bounds.maxY || coord.y < bounds.minY;
  }

  /**
   * Gets the bounds of the asteroid
   * @param asteroid asteroid entity
   * @param next if true, gets the bounds of the asteroid's next level
   */
  function getAsteroidBounds(
    asteroid: Entity,
    next?: boolean
  ): { minX: number; minY: number; maxX: number; maxY: number } {
    const level = tables.Level.get(asteroid as Entity, { value: 1n }).value;
    const asteroidDims = tables.P_Asteroid.get();
    const range = tables.Dimensions.getWithKeys({ key: Keys.EXPANSION, level: level + (next ? 1n : 0n) });
    if (!asteroidDims || !range) throw new Error("Asteroid dimensions or range not found");
    return {
      minX: Math.floor(asteroidDims.xBounds - range.width) / 2,
      minY: Math.floor(asteroidDims.yBounds - range.height) / 2,
      maxX: Math.floor(asteroidDims.xBounds + range.width) / 2,
      maxY: Math.floor(asteroidDims.yBounds + range.height) / 2,
    };
  }

  /**
   * Gets the max possible bounds of an asteroid
   * @param asteroid asteroid entity
   * @returns max bounds of asteroid
   */
  function getAsteroidMaxBounds(asteroid: Entity): { minX: number; minY: number; maxX: number; maxY: number } {
    const asteroidMaxLevel = tables.Asteroid.get(asteroid)?.maxLevel ?? 1n;
    const asteroidDims = tables.P_Asteroid.get();
    const dimensions = tables.Dimensions.getWithKeys({ key: Keys.EXPANSION, level: asteroidMaxLevel });
    if (!asteroidDims || !dimensions) throw new Error("Asteroid dimensions or range not found");

    return {
      minX: Math.floor(asteroidDims.xBounds - dimensions.width) / 2,
      minY: Math.floor(asteroidDims.yBounds - dimensions.height) / 2,
      maxX: Math.floor(asteroidDims.xBounds + dimensions.width) / 2,
      maxY: Math.floor(asteroidDims.yBounds + dimensions.height) / 2,
    };
  }

  return {
    outOfBounds,
    outOfMaxBounds,
    getAsteroidBounds,
    getAsteroidMaxBounds,
  };
}
