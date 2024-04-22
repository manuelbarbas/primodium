import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { AsteroidRelationship } from "../../constants/common";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite } from "./helpers";
import { SpriteKeys } from "@/game/lib/constants/assets/sprites";

export class ShardAsteroid extends BaseAsteroid {
  protected entity: Entity;
  constructor(scene: Scene, entity: Entity, coord: Coord) {
    super(scene, coord, SpriteKeys.Shard, SpriteKeys.AegisDrone);
    this.entity = entity;
  }

  getEntity() {
    return this.entity;
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, 1n));
  }
}
