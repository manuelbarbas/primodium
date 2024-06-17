import { Assets } from "@primodiumxyz/assets";
import { Coord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/types";
import { BaseAsteroid } from "@/lib/objects/asteroid/BaseAsteroid";
import { LODs, getPrimaryOutlineSprite, getPrimarySprite } from "@/lib/objects/asteroid/helpers";
import { Relationship } from "@/lib/constants/common";

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

  override spawn() {
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
