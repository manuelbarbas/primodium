import { EntityIndex } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

type Dimensions = { width: number; height: number };
export const blueprintCache = new Map<EntityIndex, Dimensions>();

export function calcDims(
  entity: EntityIndex,
  coordinates: Coord[]
): Dimensions {
  if (blueprintCache.has(entity)) return blueprintCache.get(entity)!;
  let minX = coordinates[0].x;
  let maxX = coordinates[0].x;
  let minY = coordinates[0].y;
  let maxY = coordinates[0].y;

  for (let i = 1; i < coordinates.length; i++) {
    minX = Math.min(minX, coordinates[i].x);
    maxX = Math.max(maxX, coordinates[i].x);
    minY = Math.min(minY, coordinates[i].y);
    maxY = Math.max(maxY, coordinates[i].y);
  }

  let width = maxX - minX + 1;
  let height = maxY - minY + 1;

  blueprintCache.set(entity, { width, height });
  return { width, height };
}

export function convertToCoords(numbers: number[]): Coord[] {
  if (numbers.length % 2 !== 0) {
    throw new Error("Input array must contain an even number of elements");
  }

  let coordinates: Coord[] = [];

  for (let i = 0; i < numbers.length; i += 2) {
    coordinates.push({ x: numbers[i], y: numbers[i + 1] });
  }

  return coordinates;
}
