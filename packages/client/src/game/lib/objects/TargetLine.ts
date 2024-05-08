import { PixelCoord } from "engine/types";
import { SceneApi } from "@/game/api/scene";
import { IPrimodiumGameObject } from "./interfaces";

export class TargetLine extends Phaser.GameObjects.Line implements IPrimodiumGameObject {
  private _scene: SceneApi;
  private spawned = false;
  private start;
  constructor(scene: SceneApi, start: PixelCoord, end: PixelCoord, color = 0x808080) {
    super(scene.phaserScene, start.x, start.y, 0, 0, end.x, end.y, color);
    this.setOrigin(0, 0);
    this.setLineWidth(2);
    this._scene = scene;
    this.start = start;
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
    const pointer = this.scene.input.activePointer;
    this.setLineWidth(2 / this._scene.phaserScene.cameras.main.zoom);
    this.setTo(0, 0, pointer.worldX - this.start.x, pointer.worldY - this.start.y);
  }

  destroy() {
    this.scene.events.removeListener("update", this.update, this);
    super.destroy();
  }
}
