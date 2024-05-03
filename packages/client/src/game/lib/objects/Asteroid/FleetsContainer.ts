import { Coord, Scene, TileCoord } from "engine/types";
import { Fleet } from "../Fleet";

const WIDTH = 150;
const HEIGHT = 100;
const MARGIN = 5;
export class FleetsContainer extends Phaser.GameObjects.Container {
  private _scene: Scene;
  private coord: TileCoord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleetsContainer: Phaser.GameObjects.Container;
  private rotationTween: Phaser.Tweens.Tween;
  private paused = false;
  private inOrbitView = true;

  constructor(scene: Scene, coord: Coord) {
    super(scene.phaserScene, coord.x, coord.y);
    this.orbitRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(2, 0x808080)
      .strokeEllipse(0, 0, WIDTH, HEIGHT);

    this.fleetsContainer = scene.phaserScene.add.container(0, 0);
    this.add([this.orbitRing, this.fleetsContainer]);
    this.coord = coord;
    this._scene = scene;

    this.rotationTween = this.scene.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: 1000 * 60,
      repeat: -1,
      onUpdate: (tween) => {
        const angleStep = (2 * Math.PI) / this.fleetsContainer.length;
        this.fleetsContainer.list.forEach((obj, index) => {
          const fleet = obj as Fleet;
          const angle = index * angleStep + tween.getValue();
          const radiusX = WIDTH / 2; // Radius for the x coordinate
          const radiusY = HEIGHT / 2; // Radius for the y coordinate
          fleet.x = this.x + radiusX * Math.cos(angle);
          fleet.y = this.y + radiusY * Math.sin(angle);
          fleet.angle = Phaser.Math.RadToDeg(angle) - 40;
        });
      },
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
      if (!this.paused) this.rotationTween.resume();
    }

    fleet.getTransitLine()?.removeFleet();
    fleet.getOrbitRing()?.removeFleet(fleet);
    fleet.setOrbitRingRef(this);
    fleet.setFlip(false, false);
    fleet.setScale(0.3);
    this.fleetsContainer.add(fleet);

    if (this.inOrbitView) this.setOrbitView();
    else this.setInlineView();

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

  setInlineView() {
    this.rotationTween.pause();

    this.orbitRing.setActive(false).setVisible(false);

    this.fleetsContainer.setAlpha(0);
    this.fleetsContainer.setRotation(0);
    this.fleetsContainer.list.forEach((_fleet, i) => {
      const fleet = _fleet as Fleet;
      fleet.setFlip(false, false);
      fleet.setPosition(fleet.displayWidth / 2 + (fleet.displayWidth + MARGIN) * i, 0);
      fleet.rotation = 0;
    });

    this.scene.add.tween({
      targets: this.fleetsContainer,
      alpha: 1,
      duration: 200,
    });

    this.inOrbitView = false;
  }

  setOrbitView() {
    if (!this.paused) this.rotationTween.resume();
    this.orbitRing.setActive(true).setVisible(true);

    this.orbitRing.setAlpha(0);
    this.scene.add.tween({
      targets: this.orbitRing,
      alpha: 1,
      duration: 200,
    });

    this.inOrbitView = true;
  }

  clear() {
    this.fleetsContainer.list.forEach((fleet) => {
      this.removeFleet(fleet as Fleet);
    });
    this.rotationTween.pause();
  }

  pauseRotation() {
    this.paused = true;

    if (this.inOrbitView) this.rotationTween.pause();
    return this;
  }

  resumeRotation() {
    this.paused = false;
    if (!this.fleetsContainer.length) return;
    if (this.inOrbitView) this.rotationTween.resume();
    return this;
  }

  spawn() {
    this.scene.add.existing(this);
    return this;
  }

  dispose() {
    this.destroy();
    this.rotationTween.destroy();
  }
}
