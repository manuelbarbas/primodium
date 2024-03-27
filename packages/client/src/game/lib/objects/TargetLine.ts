import { PixelCoord, Scene } from "engine/types";
import { IPrimodiumGameObject } from "./interfaces";

export class TargetLine extends Phaser.GameObjects.Line implements IPrimodiumGameObject {
  private _scene: Scene;
  private spawned = false;
  private start;
  constructor(scene: Scene, start: PixelCoord) {
    const pointer = scene.input.phaserInput.activePointer;

    super(scene.phaserScene, start.x, start.y, 0, 0, pointer.worldX - start.x, pointer.worldY - start.y, 0x808080);
    this.setOrigin(0, 0);
    this.setLineWidth(2);
    this._scene = scene;
    this.start = start;
    this.scene.events.addListener("update", this.update, this);
  }

  spawn() {
    this.spawned = true;
    this.scene.add.existing(this);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  update() {
    const pointer = this.scene.input.activePointer;
    this.setLineWidth(2 / this._scene.camera.phaserCamera.zoom);
    this.setTo(0, 0, pointer.worldX - this.start.x, pointer.worldY - this.start.y);
  }

  dispose() {
    this.scene.events.removeListener("update", this.update, this);
    this.destroy();
  }
}
