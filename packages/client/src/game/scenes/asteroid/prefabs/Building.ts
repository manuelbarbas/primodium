import { Assets, EntitytoBuildingSpriteKey } from "@game/constants";
import { Coord } from "@latticexyz/utils";
import { Entity } from "src/util/types";

export class Building extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, buildingType: Entity, coord: Coord) {
    console.log("Building", buildingType, coord);
    super(scene, coord.x, coord.y, Assets.SpriteAtlas, EntitytoBuildingSpriteKey[buildingType][0]);
    scene.add.existing(this);
  }
}
