import Phaser from "phaser";

import { BoundingBox } from "@primodiumxyz/engine/lib/core/StaticObjectManager";
import { PixelCoord } from "@primodiumxyz/engine/types";
import { Entity } from "@primodiumxyz/reactive-tables";
import { TargetLine } from "@game/lib/objects/TargetLine";
import { PrimodiumScene } from "@game/types";
import { Fleet } from "./Fleet";

// These boxes are rendered around the line to check for collisions
// This is a rough approximation of the line's bounding box, because we don't want to render too many boxes,
// and it's actually fine

export class TransitLine extends TargetLine {
  private start;
  private end;
  private fleet: Fleet | undefined;

  constructor(args: { id: Entity; scene: PrimodiumScene; start: PixelCoord; end: PixelCoord }) {
    const { id, scene, start, end } = args;
    super(id, scene, start, end, 0x6ad9d9);

    this.setAlpha(0.25);
    this.start = start;
    this.end = end;

    this._scene.objects.transitLine.add(id, this, true);
  }

  setFleet(fleet: Fleet) {
    //make sure the fleet is detached from any other container
    fleet.detach();
    fleet.reset();
    this.fleet = fleet;
    this._setFleetAngleAndPos();
    this.fleet.activateBurn();
    this.fleet.hideStanceIcon();

    return this;
  }

  override update() {
    this.fleet?.setScale(Math.max(1, 1 / this._scene.camera.phaserCamera.zoom));
    super.update();
  }

  override setCoordinates(start: PixelCoord, end: PixelCoord) {
    this.start = start;
    this.end = end;
    this._setFleetAngleAndPos();
    super.setCoordinates(start, end);

    // set the bounding boxes for visibility checks
    this._scene.objects.transitLine.setBoundingBoxes(this.id, generateBoundingBoxes(this.geom, this._scene.camera));
  }

  setFleetProgress(progress: number) {
    if (!this.fleet) return;

    this.scene.tweens.killTweensOf(this.fleet);

    if (progress === 1 || !this.active) {
      this.fleet.setPosition(
        this.start.x + (this.end.x - this.start.x) * progress,
        this.start.y + (this.end.y - this.start.y) * progress,
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

  override setActive(value: boolean): this {
    return super.setActive(value);
  }

  override setVisible(value: boolean): this {
    this.fleet?.setVisible(value);
    return super.setVisible(value);
  }

  override destroy(anim = false) {
    this._scene.objects.transitLine.remove(this.id);

    if (!anim) {
      super.destroy();
      return;
    }

    this.scene.add.tween({
      targets: this,
      alpha: 0,
      duration: 200,
      onStart: () => {
        this.setActive(false);
      },
      onComplete: () => {
        super.destroy();
      },
    });
  }

  private _setFleetAngleAndPos() {
    if (!this.fleet) return;

    const angle = Phaser.Math.RadToDeg(Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)) - 90;
    this.fleet.setAngle(angle);
    this.fleet.setPosition(this.start.x, this.start.y);
  }
}

// This is an approximation but more than enough for this purpose
const generateBoundingBoxes = (
  lineData: Phaser.GameObjects.Line["geom"],
  camera: PrimodiumScene["camera"],
): BoundingBox[] => {
  const { x1, y1, x2, y2 } = lineData;
  // this is an arbitrary value that seems reasonable
  const squareDimension = camera.phaserCamera.height;
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
    // center of the bounding box along the line
    const centerX = x1 + unitVectorX * (i * squareDimension + squareDimension / 2);
    const centerY = y1 + unitVectorY * (i * squareDimension + squareDimension / 2);

    // apply offset
    const offsetX = -squareDimension / 2;
    const offsetY = -squareDimension / 2;

    // calculate the top left corner of the bounding box
    const topLeftX = centerX + offsetX * unitVectorX + offsetY * -unitVectorY;
    const topLeftY = centerY + offsetX * unitVectorY + offsetY * unitVectorX;

    boundingBoxes.push(new Phaser.Geom.Rectangle(topLeftX, topLeftY, squareDimension, squareDimension));
  }

  return boundingBoxes;
};
