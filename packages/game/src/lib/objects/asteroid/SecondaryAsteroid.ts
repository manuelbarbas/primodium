import { Coord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/types";
import { BaseAsteroid } from "@/lib/objects/asteroid/BaseAsteroid";
import { LODs, getSecondaryOutlineSprite, getSecondarySprite } from "@/lib/objects/asteroid/helpers";
import { Relationship } from "@/lib/constants/common";

export class SecondaryAsteroid extends BaseAsteroid {
  private maxLevel: bigint;
  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    resourceType: Entity;
    maxLevel: bigint;
    relationship: Relationship;
  }) {
    const { id, scene, coord, resourceType, maxLevel, relationship = "Neutral" } = args;
    super({
      id,
      scene,
      coord,
      sprite: getSecondarySprite(resourceType, maxLevel),
      outlineSprite: getSecondaryOutlineSprite(relationship, maxLevel),
    });

    this._scene = scene;
    this.maxLevel = maxLevel;
    this.getAsteroidLabel().setBaseScale(0.75);
  }

  override spawn() {
    super.spawn();
    return this;
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, this.maxLevel));
  // }

  getLod(zoom: number) {
    if (zoom >= 0.75) {
      return LODs.FullyShow;
    }
    if (zoom >= 0.2) {
      return LODs.ShowLabelOnly;
    }
    if (zoom >= 0) {
      return LODs.FullyHide;
    }

    return 0;
  }
}
