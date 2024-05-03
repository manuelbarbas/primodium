import { PixelCoord, Scene } from "engine/types";
import { IPrimodiumGameObject } from "./interfaces";
import { Fleet } from "./Fleet";
import { DepthLayers } from "../constants/common";

const FLEET_ANGLE_OFFSET = 45;
export class TransitLine extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private _scene: Scene;
  private spawned = false;
  private start;
  private end;
  private fleet: Fleet | undefined;
  private transitLine?: Phaser.GameObjects.Line;
  private unsubZoom;
  constructor(scene: Scene, start: PixelCoord, end: PixelCoord) {
    super(scene.phaserScene, start.x, start.y);
    this._scene = scene;
    this.start = start;
    this.end = end;

    this.unsubZoom = scene.camera.zoom$.subscribe((zoom) => {
      this.transitLine?.setLineWidth(2 / zoom);
    });
  }

  spawn() {
    this.spawned = true;
    this.scene.add.existing(this);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  setFleet(fleet: Fleet) {
    if (!this.fleet) {
      this.setActive(true).setVisible(true);
      this.transitLine = new Phaser.GameObjects.Line(
        this.scene,
        0,
        0,
        0,
        0,
        this.end.x - this.start.x,
        this.end.y - this.start.y,
        0x808080
      )
        .setOrigin(0, 0)
        .setLineWidth(2)
        .setAlpha(0.5);
      this.add(this.transitLine);
      this.setDepth(0);
    }

    fleet.setTransitLineRef(this);
    fleet.getOrbitRing()?.removeFleet(fleet);
    this.scene.add.existing(fleet);
    // this.add(fleet);
    this.fleet = fleet;
    fleet.x = 0;
    fleet.y = 0;
    fleet.rotation = 0;
    fleet.setDepth(DepthLayers.Path);

    return this;
  }

  removeFleet() {
    if (!this.fleet) return;
    this.fleet.setTransitLineRef(null);
    this.remove(this.fleet);
    this.dispose();
  }

  update() {
    this.fleet?.setScale(Math.max(0.3, 0.3 / this._scene.camera.phaserCamera.zoom));
  }

  setCoordinates(start: PixelCoord, end: PixelCoord) {
    this.start = start;
    this.x = start.x;
    this.y = start.y;
    this.end = end;

    this.transitLine?.setTo(0, 0, end.x - start.x, end.y - start.y);
    const flipped = end.x > start.x;
    this.fleet?.setFlipX(flipped);
    this.fleet?.setAngle(
      Phaser.Math.RadToDeg(Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x)) -
        (flipped ? FLEET_ANGLE_OFFSET : 180 - FLEET_ANGLE_OFFSET)
    );
  }

  setFleetProgress(progress: number) {
    if (!this.fleet) return;

    this.fleet.x = this.start.x + (this.end.x - this.start.x) * progress;
    this.fleet.y = this.start.y + (this.end.y - this.start.y) * progress;
  }

  dispose() {
    this.transitLine?.destroy();
    this.unsubZoom.unsubscribe();
    this.destroy();
  }
}
