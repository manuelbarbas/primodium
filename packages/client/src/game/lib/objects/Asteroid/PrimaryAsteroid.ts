import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { LODs, getPrimaryOutlineSprite, getPrimarySprite } from "@/game/lib/objects/Asteroid/helpers";
import { Relationship } from "../../constants/common";
import { Assets } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";

export class PrimaryAsteroid extends BaseAsteroid {
  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord; level: bigint; relationship?: Relationship }) {
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
      return LODs.FullyShow;
    }
    if (zoom >= 0.12) {
      return LODs.ShowLabelOnly;
    }
    if (zoom >= 0) {
      return LODs.HideAsteroidAndOwnerLabel;
    }

    return LODs.FullyShow;
  }
}
