import { Coord } from "@latticexyz/utils";
import { TWO_PI, getPositionByVector, solSinDegrees } from "src/util/vector";
import { expect, test } from "vitest";

const moveResults = [
  { x: 100, y: 0 },
  { x: 89, y: 45 },
  { x: 57, y: 81 },
  { x: 12, y: 99 },
  { x: -93, y: 34 },
  { x: -66, y: 74 },
  { x: -24, y: 97 },
  { x: -97, y: -22 },
  { x: -75, y: -65 },
  { x: -35, y: -93 },
  { x: 99, y: -10 },
  { x: 82, y: -55 },
  { x: 46, y: -88 },
];

test("hashKeyCoord", () => {
  const distance: number = 100;
  const max: number = 13;
  for (let i = 0; i < max; i++) {
    const direction = Math.floor((i * 360) / max);
    console.log("distance:", distance, "direction:", direction);
    const coord: Coord = getPositionByVector(distance, direction);
    console.log(coord);
    expect(coord.x).eq(moveResults[i].x);
    expect(coord.y).eq(moveResults[i].y);
  }
});

test("sin", () => {
  const angle = 55;
  const angleDegsTimes10000 = BigInt(angle * 1745);

  const angleRads = angleDegsTimes10000 * BigInt(10000000000000) + TWO_PI;
  console.log("angleRads:", angleRads);
  const newY = solSinDegrees(angle);
  console.log("newY:", newY);
});
