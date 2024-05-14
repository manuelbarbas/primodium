import Phaser from "phaser";
import { Coord, TileCoord } from "engine/types";
import { Fleet } from "../Fleet";
import { PrimodiumScene } from "@/game/api/scene";
import { ContainerLite } from "engine/objects";

const WIDTH = 150;
const HEIGHT = 100;
const MARGIN = 5;
const COL = 5;
export class FleetsContainer extends ContainerLite {
  private _scene: PrimodiumScene;
  private coord: TileCoord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleets: ContainerLite;
  private rotationTween: Phaser.Tweens.Tween;
  private prevRotationVal: number = -1;
  private paused = false;
  private inOrbitView = true;

  constructor(scene: PrimodiumScene, coord: Coord) {
    super(scene.phaserScene, coord.x, coord.y);
    this.orbitRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(2, 0x6ad9d9, 0.1)
      .strokeEllipse(0, 0, WIDTH, HEIGHT);

    // this.orbitRing.postFX.addShine();

    this.fleets = new ContainerLite(scene.phaserScene, 0, 0);
    this.addLocalMultiple([this.orbitRing, this.fleets]);
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
        const angleStep = (2 * Math.PI) / this.getFleetCount();
        this.fleets.getChildren().forEach((obj, index) => {
          const fleet = obj as Fleet;
          const angle = index * angleStep + tween.getValue();
          const radiusX = WIDTH / 2; // Radius for the x coordinate
          const radiusY = HEIGHT / 2; // Radius for the y coordinate
          fleet.x = this.x + radiusX * Math.cos(angle);
          fleet.y = this.y + radiusY * Math.sin(angle);
          fleet.setRotationFrame(Phaser.Math.RadToDeg(angle));
          this.fleets.setChildAngle(obj, Phaser.Math.RadToDeg(angle) - fleet.getRotationFrameOffset());
          //TODO: TRAIL PARTICLES
          // fleet.particles.setActive(true).setVisible(true).resume();

          // fleet.particles.angle = Phaser.Math.RadToDeg(angle);
          // fleet.particles.setPosition(fleet.getPixelCoord().x, fleet.getPixelCoord().y);
          // const dx = coord.x - fleet.getPixelCoord().x;
          // const dy = coord.y - fleet.getPixelCoord().y;
          // const magnitude = Math.sqrt(dx * dx + dy * dy);
          // const ux = dx / magnitude;
          // const uy = dy / magnitude;
          // const gravityStrength = 10; // Adjust this value to change the strength of the gravity
          // fleet.particles.setParticleGravity(-ux * gravityStrength, uy * gravityStrength);
        });
      },
    });

    this.setChildLocalActive(this.orbitRing, false).setChildLocalVisible(this.orbitRing, false);
  }

  getFleetCount() {
    return this.fleets.getChildren().length;
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
    this.setActive(true).setVisible(true);

    fleet.detach();
    this.fleets.addLocal(fleet);

    this.updateView();

    return this;
  }

  removeFleet(fleet: Fleet, destroy = false) {
    this.fleets.remove(fleet, destroy);

    if (!this.getFleetCount()) {
      this.setActive(false).setVisible(false);
      return this;
    }

    this.updateView();

    return this;
  }

  setInlineView(offsetX = 32, offsetY = 24) {
    this.rotationTween.pause();
    this.setChildLocalActive(this.orbitRing, false).setChildLocalVisible(this.orbitRing, false);

    this.fleets.getChildren().forEach((_fleet, i) => {
      const fleet = _fleet as Fleet;
      fleet.reset();
      this.fleets.resetChildRotationState(fleet);
      const col = Math.floor(i / COL) * (fleet.displayHeight / 2 + MARGIN);
      const row = (fleet.displayWidth / 2 + MARGIN) * i;
      const x = row - (col > 0 ? COL : 0) * (fleet.displayWidth / 2 + MARGIN);
      const y = col;

      this.setChildLocalPosition(fleet, x + offsetX, y + offsetY);
      fleet.particles.pause().setActive(false).setVisible(false);
    });

    this.inOrbitView = false;
  }

  setOrbitView() {
    if (this.getFleetCount()) {
      this.setChildLocalActive(this.orbitRing, true).setChildLocalVisible(this.orbitRing, true);
      if (!this.paused) this.rotationTween.resume();
    } else this.setChildLocalActive(this.orbitRing, false).setChildLocalVisible(this.orbitRing, false);

    this.prevRotationVal = -1;
    this.setScale(1);
    this.inOrbitView = true;

    return this;
  }

  updateView() {
    if (this.inOrbitView) this.setOrbitView();
    else this.setInlineView();
  }

  clearOrbit(destroy = false) {
    this.fleets.clear(destroy);
    this.setActive(false).setVisible(false);
  }

  pauseRotation() {
    this.paused = true;

    if (this.inOrbitView) this.rotationTween.pause();
    return this;
  }

  resumeRotation() {
    this.paused = false;
    if (!this.getFleetCount()) return;
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

  update() {
    this.fleets.getChildren().forEach((fleet) => {
      (fleet as Fleet).update();
    });

    if (this.inOrbitView) return;

    this.setScale(1 / this._scene.camera.phaserCamera.zoom);
  }

  destroy() {
    this.clearOrbit(true);
    this.rotationTween.destroy();
    super.destroy();
  }
}
