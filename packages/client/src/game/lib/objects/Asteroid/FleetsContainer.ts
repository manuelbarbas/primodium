import Phaser from "phaser";
import { Coord, TileCoord } from "engine/types";
import { Fleet } from "../Fleet";
import { PrimodiumScene } from "@/game/api/scene";

const WIDTH = 150;
const HEIGHT = 100;
const MARGIN = 5;
const COL = 5;
export class FleetsContainer extends Phaser.GameObjects.Container {
  private _scene: PrimodiumScene;
  private coord: TileCoord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleetsContainer: Phaser.GameObjects.Container;
  private rotationTween: Phaser.Tweens.Tween;
  private prevRotationVal: number = -1;
  private paused = false;
  private inOrbitView = true;

  constructor(scene: PrimodiumScene, coord: Coord) {
    super(scene.phaserScene, coord.x, coord.y);
    this.orbitRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(2, 0x6ad9d9, 0.1)
      .strokeEllipse(0, 0, WIDTH, HEIGHT);

    this.orbitRing.postFX.addShine();

    this.fleetsContainer = scene.phaserScene.add.container(0, 0);
    this.add([this.orbitRing, this.fleetsContainer]);
    this.coord = coord;
    this._scene = scene;

    this.rotationTween = this.scene.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: 1000 * 30,
      ease: (t: number) => Phaser.Math.Easing.Stepped(t, 120),
      repeat: -1,
      paused: true,
      onUpdate: (tween) => {
        if (this.prevRotationVal === tween.getValue()) return;
        this.prevRotationVal = tween.getValue();
        const angleStep = (2 * Math.PI) / this.fleetsContainer.length;
        this.fleetsContainer.list.forEach((obj, index) => {
          const fleet = obj as Fleet;
          const angle = index * angleStep + tween.getValue();
          const radiusX = WIDTH / 2; // Radius for the x coordinate
          const radiusY = HEIGHT / 2; // Radius for the y coordinate
          fleet.x = this.x + radiusX * Math.cos(angle);
          fleet.y = this.y + radiusY * Math.sin(angle);
          fleet.setRotationFrame(Phaser.Math.RadToDeg(angle));
          fleet.angle = Phaser.Math.RadToDeg(angle) - fleet.getRotationFrameOffset();
          //TODO: TRAIL PARTICLES
          fleet.particles.setActive(true).setVisible(true).resume();

          fleet.particles.angle = Phaser.Math.RadToDeg(angle);
          fleet.particles.setPosition(fleet.getPixelCoord().x, fleet.getPixelCoord().y);
          const dx = coord.x - fleet.getPixelCoord().x;
          const dy = coord.y - fleet.getPixelCoord().y;
          const magnitude = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / magnitude;
          const uy = dy / magnitude;
          const gravityStrength = 10; // Adjust this value to change the strength of the gravity
          fleet.particles.setParticleGravity(-ux * gravityStrength, uy * gravityStrength);
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
    fleet.setScale(1);
    this.fleetsContainer.add(fleet);

    if (this.inOrbitView) this.setOrbitView();
    else this.setInlineView();

    return this;
  }

  removeFleet(fleet: Fleet) {
    this.fleetsContainer.remove(fleet);
    if (!this.fleetsContainer.length) {
      if (this.inOrbitView) this.setOrbitView();
      else this.setInlineView();
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
      fleet.reset();
      const col = Math.floor(i / COL) * (fleet.displayHeight / 2 + MARGIN);
      const row = fleet.displayWidth / 2 + (fleet.displayWidth / 2 + MARGIN) * i;
      fleet.setPosition(row - (col > 0 ? COL : 0) * (fleet.displayWidth / 2 + MARGIN), col);
      fleet.particles.pause().setActive(false).setVisible(false);
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

    this.prevRotationVal = -1;
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

  clearAndDestroy() {
    this.fleetsContainer.list.forEach((fleet) => {
      this.removeFleet(fleet as Fleet);
      fleet.destroy();
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

  setActive(value: boolean): this {
    if (value && !this.paused) this.rotationTween.play();
    else this.rotationTween.pause();

    super.setActive(value);

    return this;
  }
  destroy() {
    this.rotationTween.destroy();
    super.destroy();
  }
}
