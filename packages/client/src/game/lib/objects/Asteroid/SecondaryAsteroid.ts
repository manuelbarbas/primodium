import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite, getSecondarySprite } from "./helpers";
import { Entity } from "@latticexyz/recs";
import { AsteroidRelationship } from "../../constants/common";

export class SecondaryAsteroid extends BaseAsteroid {
  private maxLevel: bigint;
  constructor(args: {
    id: Entity;
    scene: Scene;
    coord: Coord;
    resourceType: Entity;
    maxLevel: bigint;
    relationship: AsteroidRelationship;
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

  spawn() {
    super.spawn();
    return this;
  }

  // setRelationship(relationship: AsteroidRelationship) {
  //   this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, this.maxLevel));
  // }

  getLod(zoom: number) {
    if (zoom >= 0.75) {
      return 0;
    }
    if (zoom >= 0.2) {
      return 1;
    }
    if (zoom >= 0) {
      return 3;
    }

    return 0;
  }
}
