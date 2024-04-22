import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { EntityType } from "src/util/constants";
import { AsteroidRelationship } from "../../constants/common";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite, getSecondarySprite } from "./helpers";
import { SpriteKeys } from "@/game/lib/constants/assets/sprites";

export class ShardAsteroid extends BaseAsteroid {
  protected entity: Entity;
  constructor(scene: Scene, entity: Entity, coord: Coord, relationship: AsteroidRelationship = "Neutral") {
    const sprite = getSecondarySprite(EntityType.Kimberlite, 3n);
    super(scene, coord, sprite, SpriteKeys.Shard);
    this.entity = entity;
  }

  getEntity() {
    return this.entity;
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, 1n));
  }
}
