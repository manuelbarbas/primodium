import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getPrimaryOutlineSprite, getPrimarySprite } from "./helpers";
import { AsteroidRelationship } from "../../constants/common";
import { Assets } from "@primodiumxyz/assets";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(scene: Scene, coord: Coord, level = 1n, relationship: AsteroidRelationship = "Enemy") {
    super({
      scene,
      coord,
      sprite: getPrimarySprite(level),
      outlineSprite: getPrimaryOutlineSprite(relationship),
    });
  }

  setLevel(level: bigint) {
    this.asteroidSprite.setTexture(Assets.SpriteAtlas, getPrimarySprite(level));
    this.asteroidLabel.setLevel(level);

    return this;
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(Assets.SpriteAtlas, getPrimaryOutlineSprite(relationship));

    return this;
  }
}
