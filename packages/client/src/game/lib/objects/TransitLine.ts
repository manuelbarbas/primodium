import Phaser from "phaser";

import { PixelCoord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { Fleet } from "./Fleet";
import { Entity } from "@latticexyz/recs";
import { TargetLine } from "@/game/lib/objects/TargetLine";

export class TransitLine extends TargetLine {
  private id: Entity;
  private start;
  private end;
  private fleet: Fleet | undefined;

  constructor(args: { id: Entity; scene: PrimodiumScene; start: PixelCoord; end: PixelCoord }) {
    const { id, scene, start, end } = args;
    super(scene, start, end, 0x808080);
    this.start = start;
    this.end = end;

    this.id = id;

    this._scene.objects.transitLine.add(id, this, false);
  }

  setFleet(fleet: Fleet) {
    //make sure the fleet is detached from any other container
    fleet.detach();
    fleet.reset();
    this.fleet = fleet;
    this._setFleetAngleAndPos();

    return this;
  }

  update() {
    this.fleet?.setScale(Math.max(1, 1 / this._scene.camera.phaserCamera.zoom));
    super.update();
  }

  setCoordinates(start: PixelCoord, end: PixelCoord) {
    this.start = start;
    this.end = end;
    this._setFleetAngleAndPos();
    super.setCoordinates(start, end);
  }

  setFleetProgress(progress: number) {
    console.log(this.fleet);
    if (!this.fleet) return;

    this.scene.tweens.killTweensOf(this.fleet);

    if (progress === 1) {
      this.fleet.setPosition(
        this.start.x + (this.end.x - this.start.x) * progress,
        this.start.y + (this.end.y - this.start.y) * progress
      );
      return;
    }

    this.scene.add.tween({
      targets: this.fleet,
      duration: 500,
      ease: (v: number) => Phaser.Math.Easing.Stepped(v, 5),
      x: this.start.x + (this.end.x - this.start.x) * progress,
      y: this.start.y + (this.end.y - this.start.y) * progress,
    });
  }

  destroy() {
    this._scene.objects.transitLine.remove(this.id);
    super.destroy();
  }

  private _setFleetAngleAndPos() {
    if (!this.fleet) return;

    let angle = Phaser.Math.RadToDeg(Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)) - 90;
    if (angle < 0) {
      angle += 360;
    }
    this.fleet.setRotationFrame(angle);
    this.fleet.setAngle(angle - this.fleet.getRotationFrameOffset());
    this.fleet.setPosition(this.start.x, this.start.y);
  }
}
