import { Coord } from "@latticexyz/utils";

export const deg2rad = (degrees: number) => degrees * (Math.PI / 180);

export function getPositionByVector(
  origin: Coord = { x: 0, y: 0 },
  distance: number,
  direction: number
): Coord {
  const finalAngle = direction % 360;
  const finalAngleRad = deg2rad(finalAngle);
  const x = Math.cos(finalAngleRad) * distance + origin.x;
  const y = Math.sin(finalAngleRad) * distance + origin.y;

  return { x: Math.round(x), y: Math.round(y) };
}
