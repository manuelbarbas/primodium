import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BaseAsteroid } from "./BaseAsteroid";
import { getSecondarySprite } from "./helpers";
import { Entity } from "@latticexyz/recs";

export class SecondaryAsteroid extends BaseAsteroid {
  constructor(scene: Scene, coord: Coord, resourceType: Entity, maxLevel: bigint) {
    super(scene, coord, getSecondarySprite(resourceType, maxLevel));
  }
}
