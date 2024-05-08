import { PixelCoord } from "engine/types";
import { SceneApi } from "@/game/api/scene";
import { IPrimodiumGameObject } from "./interfaces";
import { Fleet } from "./Fleet";
import { Entity } from "@latticexyz/recs";

export class TransitLine extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private _scene: SceneApi;
  private id: Entity;
  private spawned = false;
  private start;
  private end;
  private fleet: Fleet | undefined;
  private transitLine?: Phaser.GameObjects.Line;
  private unsubZoom;

  constructor(args: { id: Entity; scene: SceneApi; start: PixelCoord; end: PixelCoord }) {
    const { id, scene, start, end } = args;
    super(scene.phaserScene, start.x, start.y);
    this._scene = scene;
    this.start = start;
    this.end = end;

    this.id = id;

    this.unsubZoom = scene.camera.zoom$.subscribe((zoom) => {
      this.transitLine?.setLineWidth(2 / zoom);
    });

    this._scene.objects.transitLine.add(id, this, false);
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
    }

    fleet.setTransitLineRef(this);
    fleet.getOrbitRing()?.removeFleet(fleet);
    this.scene.add.existing(fleet);
    this.add(fleet);
    this.fleet = fleet;
    fleet.x = 0;
    fleet.y = 0;
    fleet.rotation = 0;

    return this;
  }

  removeFleet() {
    if (!this.fleet) return;
    this.fleet.setTransitLineRef(null);
    this.remove(this.fleet);
    this.dispose();
  }

  update() {
    this.fleet?.setScale(Math.max(0.5, 0.5 / this._scene.camera.phaserCamera.zoom));
  }

  setCoordinates(start: PixelCoord, end: PixelCoord) {
    this.start = start;
    this.x = start.x;
    this.y = start.y;
    this.end = end;

    this.transitLine?.setTo(0, 0, end.x - start.x, end.y - start.y);

    let angle = Phaser.Math.RadToDeg(Math.atan2(end.y - start.y, end.x - start.x)) - 90;
    if (angle < 0) {
      angle += 360;
    }
    this.fleet?.setRotationFrame(angle);
    if (this.fleet) this.fleet.angle = angle - this.fleet.getRotationFrameOffset();
  }

  setFleetProgress(progress: number) {
    if (!this.fleet) return;

    this.scene.tweens.killTweensOf(this.fleet);

    if (progress === 1) {
      this.fleet.setPosition((this.end.x - this.start.x) * progress, (this.end.y - this.start.y) * progress);
      return;
    }

    this.scene.add.tween({
      targets: this.fleet,
      duration: 500,
      ease: (v: number) => Phaser.Math.Easing.Stepped(v, 5),
      x: (this.end.x - this.start.x) * progress,
      y: (this.end.y - this.start.y) * progress,
    });
  }

  dispose() {
    this.transitLine?.destroy();
    this.unsubZoom.unsubscribe();
    this.destroy();
  }
}
