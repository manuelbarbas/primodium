import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getPrimarySprite } from "./helpers";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(scene: Scene, coord: Coord, level = 1n) {
    super(scene, coord, getPrimarySprite(level));
  }

  setLevel(level: bigint) {
    this.asteroidSprite.setTexture(getPrimarySprite(level));
  }
}
