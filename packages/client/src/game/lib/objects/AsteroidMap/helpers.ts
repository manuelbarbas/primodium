import { Coord } from "engine/types";

export type Dimensions = {
  xBounds: number;
  yBounds: number;
};

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export type ResourceTile = {
  id: number;
  x: number;
  y: number;
};

export function getRelativeCoord(coord: Coord, maxBounds: Bounds) {
  return {
    x: coord.x - maxBounds.minX,
    y: coord.y - maxBounds.minY,
  };
}

export function isOutOfBounds(coord: Coord, bounds: Bounds) {
  return coord.x >= bounds.maxX || coord.x < bounds.minX || coord.y >= bounds.maxY || coord.y < bounds.minY;
}
