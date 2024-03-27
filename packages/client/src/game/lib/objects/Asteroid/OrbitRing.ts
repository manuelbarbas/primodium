import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord, Scene } from "engine/types";
import { Fleet } from "../Fleet";

const RADIUS = 75;
export class OrbitRing extends Phaser.GameObjects.Container {
  private _scene: Scene;
  private coord: Coord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleetsContainer: Phaser.GameObjects.Container;
  private fleetCount = 0;
  private unsubZoom;
  private rotationTween: Phaser.Tweens.Tween;

  constructor(scene: Scene, coord: Coord) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);
    this.orbitRing = scene.phaserScene.add
      .graphics()
      .lineStyle(2 / scene.camera.phaserCamera.zoom, 0x808080)
      .strokeCircle(0, 0, RADIUS);

    this.fleetsContainer = scene.phaserScene.add.container(0, 0);
    this.add([this.orbitRing, this.fleetsContainer]);
    this.coord = coord;
    this._scene = scene;

    this.unsubZoom = scene.camera.zoom$.subscribe((zoom) => {
      if (!this.fleetCount) return;
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

  addFleet(fleet: Fleet) {
    if (!this.fleetCount) {
      this.setActive(true).setVisible(true);
      this.rotationTween.resume();
    }

    this.fleetsContainer.add(fleet);
    this.fleetCount++;

    const angleStep = (2 * Math.PI) / this.fleetCount;

    this.fleetsContainer.list.forEach((obj, index) => {
      const fleet = obj as Fleet;
      const angle = index * angleStep;
      fleet.x = this.x + RADIUS * Math.cos(angle);
      fleet.y = this.y + RADIUS * Math.sin(angle);
      fleet.angle = Phaser.Math.RadToDeg(angle) - 35; // Subtract 90 to make the sprite face the direction of movement
    });

    return this;
  }

  removeOrbitingFleet(fleet: Fleet) {
    if (this.fleetCount === 1) {
      this.setActive(false).setVisible(false);
      this.rotationTween.pause();
    }

    this.fleetsContainer.remove(fleet);
    this.fleetCount--;
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
