import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { getPrimaryOutlineSprite, getPrimarySprite } from "./helpers";
import { AsteroidRelationship } from "../../constants/common";
import { Assets } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    level: bigint;
    relationship?: AsteroidRelationship;
  }) {
    const { id, scene, coord, level = 1n, relationship = "Enemy" } = args;
    super({
      id,
      scene,
      coord,
      sprite: getPrimarySprite(level),
      outlineSprite: getPrimaryOutlineSprite(relationship),
    });

    this.asteroidLabel.setBaseScale(0.9);
  }

  spawn() {
    super.spawn();
    return this;
  }

  setLevel(level: bigint) {
    this.asteroidSprite.setTexture(Assets.SpriteAtlas, getPrimarySprite(level));

    return this;
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   // this.outlineSprite.setTexture(Assets.SpriteAtlas, getPrimaryOutlineSprite(relationship));

  //   return this;
  // }

  getLod(zoom: number) {
    if (zoom >= 0.75) {
      return 0;
    }
    if (zoom >= 0.12) {
      return 1;
    }
    if (zoom >= 0) {
      return 2;
    }

    return 0;
  }
}
