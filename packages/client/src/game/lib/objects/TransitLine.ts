import Phaser from "phaser";

import { PixelCoord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { Fleet } from "./Fleet";
import { Entity } from "@latticexyz/recs";
import { TargetLine } from "@/game/lib/objects/TargetLine";
import { BoundingBox } from "engine/lib/core/StaticObjectManager";

// These boxes are rendered around the line to check for collisions
// This is a rough approximation of the line's bounding box, because we don't want to render too many boxes,
// and it's actually fine

export class TransitLine extends TargetLine {
  private id: Entity;
  private start;
  private end;
  private fleet: Fleet | undefined;

  constructor(args: { id: Entity; scene: PrimodiumScene; start: PixelCoord; end: PixelCoord }) {
    const { id, scene, start, end } = args;
    super(scene, start, end, 0x6ad9d9);

    this.setAlpha(0.25);
    this.start = start;
    this.end = end;

    this.id = id;

    this._scene.objects.transitLine.add(id, this, true);
  }

  setFleet(fleet: Fleet) {
    //make sure the fleet is detached from any other container
    fleet.detach();
    fleet.reset();
    this.fleet = fleet;
    this._setFleetAngleAndPos();
    this.fleet.activateBurn();

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

    // set the bounding boxes for visibility checks
    console.log(this.start, this.end, this.geom, this.getBounds(), this.pathData);
    this._scene.objects.transitLine.setBoundingBoxes(this.id, generateBoundingBoxes(this.geom, this._scene.camera));
  }

  setFleetProgress(progress: number) {
    if (!this.fleet) return;

    this.scene.tweens.killTweensOf(this.fleet);

    if (progress === 1 || !this.active) {
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

  setActive(value: boolean): this {
    this.fleet?.setActive(value);
    return super.setActive(value);
  }

  setVisible(value: boolean): this {
    this.fleet?.setVisible(value);
    return super.setVisible(value);
  }

  destroy() {
    this._scene.objects.transitLine.remove(this.id);

    this.scene.add.tween({
      targets: this,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        super.destroy();
      },
    });
  }

  private _setFleetAngleAndPos() {
    if (!this.fleet) return;

    let angle = Phaser.Math.RadToDeg(Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)) - 90;

    if (angle < 0) {
      angle += 360;
    }

    this.fleet.setRotationFrame(angle);
    this.fleet.setAngle(angle - this.fleet.getRotationFrameOffset());
    this.fleet.particles.setAngle(angle);
    this.fleet.setPosition(this.start.x, this.start.y);
  }
}

const generateBoundingBoxes = (
  lineData: Phaser.GameObjects.Line["geom"],
  camera: PrimodiumScene["camera"]
): BoundingBox[] => {
  const { x1, y1, x2, y2 } = lineData;
  // this is an arbitrary value that seems reasonable
  const squareDimension = camera.phaserCamera.height / 10;
  const boundingBoxes: BoundingBox[] = [];

  // calculate the total length of the line and amount of squares needed
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLength = Math.sqrt(dx * dx + dy * dy);
  const numSquares = Math.ceil(lineLength / squareDimension);

  // calculate the unit vector along the line direction
  const unitVectorX = dx / lineLength;
  const unitVectorY = dy / lineLength;

  // generate bounding boxes
  for (let i = 0; i < numSquares; i++) {
    const centerX = x1 + unitVectorX * (i * squareDimension + squareDimension / 2);
    const centerY = y1 + unitVectorY * (i * squareDimension + squareDimension / 2);
    const topLeftX = centerX - squareDimension / 2;
    const topLeftY = centerY - squareDimension / 2;

    boundingBoxes.push(new Phaser.Geom.Rectangle(topLeftX, topLeftY, squareDimension, squareDimension));
  }

  return boundingBoxes;
};
