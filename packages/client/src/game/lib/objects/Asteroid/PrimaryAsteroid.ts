import { Coord } from "@latticexyz/utils";
import { SceneApi } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { getPrimaryOutlineSprite, getPrimarySprite } from "./helpers";
import { AsteroidRelationship } from "../../constants/common";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(scene: SceneApi, coord: Coord, level = 1n, relationship: AsteroidRelationship = "Enemy") {
    super(scene, coord, getPrimarySprite(level), getPrimaryOutlineSprite(relationship));
  }

  setLevel(level: bigint) {
    this.asteroidSprite.setTexture(getPrimarySprite(level));
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getPrimaryOutlineSprite(relationship));
  }
}
