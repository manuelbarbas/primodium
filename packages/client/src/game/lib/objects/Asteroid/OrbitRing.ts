import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Scene, TileCoord } from "engine/types";
import { Fleet } from "../Fleet";

const RADIUS = 60;
export class OrbitRing extends Phaser.GameObjects.Container {
  private _scene: Scene;
  private coord: TileCoord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleetsContainer: Phaser.GameObjects.Container;
  private unsubZoom;
  private rotationTween: Phaser.Tweens.Tween;

  constructor(scene: Scene, coord: TileCoord) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);
    this.orbitRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(2 / scene.camera.phaserCamera.zoom, 0x808080)
      .strokeCircle(0, 0, RADIUS);

    this.fleetsContainer = scene.phaserScene.add.container(0, 0);
    this.add([this.orbitRing, this.fleetsContainer]);
    this.coord = coord;
    this._scene = scene;

    this.unsubZoom = scene.camera.zoom$.subscribe((zoom) => {
      if (!this.fleetsContainer.length) return;
      this.orbitRing
        .clear()
        .lineStyle(2 / zoom, 0x808080)
        .strokeCircle(0, 0, RADIUS);
    });

    this.rotationTween = this.scene.tweens.add({
      targets: this.fleetsContainer,
      rotation: Math.PI * 2,
      duration: 1000 * 60,
      repeat: -1,
      paused: true,
    });

    this.setActive(false).setVisible(false);
  }
  getFleetCount() {
    return this.fleetsContainer.length;
  }

  getPixelCoord() {
    const container = this.parentContainer;
    const matrix = container.getWorldTransformMatrix();
    const point = matrix.transformPoint(this.x, this.y);

    return { x: point.x, y: point.y };
  }

  getTileCoord() {
    const container = this.parentContainer;
    const matrix = container.getWorldTransformMatrix();
    const point = matrix.transformPoint(this.x, this.y);

    return { x: point.x / this._scene.tiled.tileWidth, y: -point.y / this._scene.tiled.tileHeight };
  }

  addFleet(fleet: Fleet) {
    if (!this.fleetsContainer.length) {
      this.setActive(true).setVisible(true);
      this.rotationTween.resume();
    }

    fleet.getTransitLine()?.removeFleet();
    fleet.setOrbitRingRef(this);
    fleet.setFlip(false, false);
    this.fleetsContainer.add(fleet);

    const angleStep = (2 * Math.PI) / this.fleetsContainer.length;

    this.fleetsContainer.list.forEach((obj, index) => {
      const fleet = obj as Fleet;
      const angle = index * angleStep;
      fleet.x = this.x + RADIUS * Math.cos(angle);
      fleet.y = this.y + RADIUS * Math.sin(angle);
      fleet.angle = Phaser.Math.RadToDeg(angle) - 35;
    });

    return this;
  }

  removeFleet(fleet: Fleet) {
    this.fleetsContainer.remove(fleet);
    if (!this.fleetsContainer.length) {
      this.setActive(false).setVisible(false);
      this.rotationTween.pause();
      fleet.setOrbitRingRef(null);
    }

    return this;
  }

  pauseRotation() {
    this.rotationTween.pause();
    return this;
  }

  resumeRotation() {
    this.rotationTween.resume();
    return this;
  }

  spawn() {
    this.scene.add.existing(this);
    return this;
  }

  dispose() {
    this.destroy();
    this.rotationTween.destroy();
    this.unsubZoom.unsubscribe();
  }
}
