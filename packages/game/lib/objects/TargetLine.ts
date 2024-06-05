import Phaser from "phaser";
import { PixelCoord } from "@primodiumxyz/engine/types";
import { PrimodiumScene } from "@/api/scene";
import { IPrimodiumGameObject } from "./interfaces";

export class TargetLine extends Phaser.GameObjects.Line implements IPrimodiumGameObject {
  protected _scene: PrimodiumScene;
  private spawned = false;
  constructor(scene: PrimodiumScene, start: PixelCoord, end: PixelCoord, color = 0x808080) {
    super(scene.phaserScene, start.x, start.y, 0, 0, end.x, end.y, color);
    this.setOrigin(0, 0);
    this.setLineWidth(2);
    this._scene = scene;
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

  update() {
    this.setLineWidth(2 / this._scene.phaserScene.cameras.main.zoom);
  }

  destroy() {
    super.destroy();
  }
}
