import Phaser from "phaser";
import { PixelCoord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@game/types";
import { IPrimodiumGameObject } from "./interfaces";

export class TargetLine extends Phaser.GameObjects.Line implements IPrimodiumGameObject {
  readonly id: Entity;
  protected _scene: PrimodiumScene;
  private spawned = false;

  constructor(id: Entity, scene: PrimodiumScene, start: PixelCoord, end: PixelCoord, color = 0x808080) {
    super(scene.phaserScene, start.x, start.y, 0, 0, end.x, end.y, color);
    this.setOrigin(0, 0);
    this.setLineWidth(2);
    this._scene = scene;
    this.id = id;
  }

  spawn() {
    this.spawned = true;
    this.scene.add.existing(this);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  setCoordinates(start: PixelCoord, end: PixelCoord) {
    this.setTo(start.x, start.y, end.x, end.y);
  }

  override update() {
    this.setLineWidth(2 / this._scene.phaserScene.cameras.main.zoom);
  }

  override destroy() {
    super.destroy();
  }
}
