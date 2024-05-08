import { Coord } from "@latticexyz/utils";
import { SceneApi } from "@/game/api/scene";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite, getSecondarySprite } from "./helpers";
import { Entity } from "@latticexyz/recs";
import { AsteroidRelationship } from "../../constants/common";

export class SecondaryAsteroid extends BaseAsteroid {
  private maxLevel: bigint;
  constructor(
    scene: SceneApi,
    coord: Coord,
    resourceType: Entity,
    maxLevel: bigint,
    relationship: AsteroidRelationship = "Neutral"
  ) {
    super(scene, coord, getSecondarySprite(resourceType, maxLevel), getSecondaryOutlineSprite(relationship, maxLevel));

    this.maxLevel = maxLevel;
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, this.maxLevel));
  }
}
