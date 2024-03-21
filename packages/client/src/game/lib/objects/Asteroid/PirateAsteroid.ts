import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { SpriteKeys } from "../../constants/assets/sprites";

export class PirateAsteroid extends BaseAsteroid {
  constructor(scene: Scene, coord: Coord) {
    super(scene, coord, SpriteKeys.PirateAsteroid1, SpriteKeys.AsteroidPirate);
  }

  setRelationship() {
    console.warn("Cannot change PirateAsteroid relationship.");
  }
}
