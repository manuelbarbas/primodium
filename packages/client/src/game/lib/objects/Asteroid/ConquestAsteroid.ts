import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { EntityType } from "src/util/constants";
import { AsteroidRelationship } from "../../constants/common";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondaryOutlineSprite, getSecondarySprite } from "./helpers";

export class ConquestAsteroid extends BaseAsteroid {
  constructor(scene: Scene, coord: Coord, relationship: AsteroidRelationship = "Neutral") {
    const sprite = getSecondarySprite(EntityType.Kimberlite, 3n);
    console.log("Conquest asteroid data:", sprite);
    super(scene, coord, sprite, getSecondaryOutlineSprite(relationship, 1n));
  }

  setRelationship(relationship: AsteroidRelationship) {
    this.outlineSprite.setTexture(getSecondaryOutlineSprite(relationship, 1n));
  }
}
