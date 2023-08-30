import { Coord } from "@latticexyz/utils";
import { TWO_PI, getPositionByVector, solSinDegrees } from "src/util/vector";
import { expect, test } from "vitest";

const moveResults = [
  { direction: 0, x: 100, y: 0, parent: 0 },
  { direction: 27, x: 89, y: 45, parent: 0 },
  { direction: 55, x: 57, y: 81, parent: 0 },
  { direction: 83, x: 12, y: 99, parent: 0 },
  { direction: 110, x: -34, y: 93, parent: 0 },
  { direction: 138, x: -74, y: 66, parent: 0 },
  { direction: 166, x: -97, y: 24, parent: 0 },
  { direction: 193, x: -97, y: -22, parent: 0 },
  { direction: 221, x: -75, y: -65, parent: 0 },
  { direction: 249, x: -35, y: -93, parent: 0 },
  { direction: 276, x: 10, y: -99, parent: 0 },
  { direction: 304, x: 55, y: -82, parent: 0 },
  { direction: 332, x: 88, y: -47, parent: 0 },
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
