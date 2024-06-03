import Phaser from "phaser";
import { Coord, TileCoord } from "engine/types";
import { Fleet } from "../Fleet";
import { PrimodiumScene } from "@/game/api/scene";
import { DepthLayers } from "@/game/lib/constants/common";

const WIDTH = 150;
const HEIGHT = 100;
const MARGIN = 5;
const COL = 5;
export class FleetsContainer extends Phaser.GameObjects.Container {
  private _scene: PrimodiumScene;
  private coord: TileCoord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private blockedRing: Phaser.GameObjects.Graphics;
  private fleets: Phaser.GameObjects.Container;
  private rotationTween: Phaser.Tweens.Tween;
  private prevRotationVal: number = -1;
  private paused = false;
  private isBlocked = false;
  private inOrbitView = true;

  constructor(scene: PrimodiumScene, coord: Coord) {
    super(scene.phaserScene, coord.x, coord.y);
    this.orbitRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(2, 0x6ad9d9, 0.1)
      .strokeEllipse(0, 0, WIDTH, HEIGHT);
    this.blockedRing = new Phaser.GameObjects.Graphics(scene.phaserScene)
      .lineStyle(4, 0xff0000, 0.1)
      .strokeEllipse(0, 0, WIDTH, HEIGHT)
      .setScale(1.5)
      .setActive(false)
      .setVisible(false);

    // this.orbitRing.postFX.addShine();

    this.fleets = scene.phaserScene.add.container(0, 0);
    this.add([this.blockedRing, this.orbitRing, this.fleets]);
    this.coord = coord;
    this._scene = scene;

    this.rotationTween = this.scene.tweens.addCounter({
      from: 0,
      to: Math.PI * 2,
      duration: 1000 * 60,
      ease: (t: number) => Phaser.Math.Easing.Stepped(t, 240),
      repeat: -1,
      paused: true,
      onUpdate: (tween) => {
        if (this.prevRotationVal === tween.getValue()) return;
        this.prevRotationVal = tween.getValue();
        const angleStep = (2 * Math.PI) / this.fleets.length;
        const radiusX = WIDTH / 2; // Radius for the x coordinate
        const radiusY = HEIGHT / 2; // Radius for the y coordinate

        this.fleets.list.forEach((obj, index) => {
          const fleet = obj as Fleet;
          const angle = index * angleStep + tween.getValue();
          fleet.x = radiusX * Math.cos(angle);
          fleet.y = radiusY * Math.sin(angle);
          fleet.setRotation(angle);
        });
      },
    });

    this.setActive(false).setVisible(false);
  }

  getFleetCount() {
    return this.fleets.length;
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
    fleet.detach();
    this.fleets.add(fleet);
    fleet.reset();
    this.setActive(true).setVisible(true);
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

  updateView() {
    if (this.inOrbitView) this.setOrbitView();
    else this.setInlineView();
  }

  setInlineView(offsetX = 32, offsetY = 24) {
    this.rotationTween.pause();
    this.orbitRing.setActive(false).setVisible(false);
    this.blockedRing.setActive(false).setVisible(false);

    // this.fleets.setAlpha(0);
    // this.fleets.setRotation(0);

    this.setDepth(DepthLayers.Marker);
    this.fleets.list.forEach((_fleet, i) => {
      const fleet = _fleet as Fleet;
      fleet.reset();
      const col = i % COL;
      const row = Math.floor(i / COL);
      const posX = col * (fleet.width / 2 + MARGIN);
      const posY = row * (fleet.height / 2 + MARGIN);
      fleet.setPosition(posX + offsetX, posY + offsetY);
      fleet.hideStanceIcon();
      fleet.deactivateBurn();
    });

    this.scene.add.tween({
      targets: this.fleets,
      alpha: 1,
      duration: 200,
    });

    this.inOrbitView = false;
  }

  setOrbitView() {
    if (this.getFleetCount()) {
      //TODO: increase width and height depending on fleet count
      this.orbitRing.setActive(true).setVisible(true);
      if (!this.paused) this.rotationTween.resume();
      this.fleets.each((fleet: Fleet) => {
        fleet.showStanceIcon();
        fleet.activateBurn();
      });
    } else this.orbitRing.setActive(false).setVisible(false);

    if (this.isBlocked) this.blockedRing.setActive(true).setVisible(true);

    this.prevRotationVal = -1;
    this.setScale(1).setDepth(DepthLayers.Rock);
    this.inOrbitView = true;

    return this;
  }

  clearOrbit(destroy = false) {
    this.fleets.removeAll(destroy);
    this.setActive(false).setVisible(false);
  }

  showBlockRing(anim = false) {
    this.isBlocked = true;

    if (!anim) {
      this.blockedRing.setActive(true).setVisible(true);
      return this;
    }

    //kill existing tween
    this.scene.tweens.killTweensOf(this.blockedRing);
    this.scene.add.tween({
      targets: this.blockedRing,
      alpha: 1,
      duration: 200,
      onComplete: () => {
        this.blockedRing.setActive(true).setVisible(true);
      },
    });

    return this;
  }

  hideBlockRing(anim = false) {
    this.isBlocked = false;

    if (!anim) {
      this.blockedRing.setActive(false).setVisible(false);
      return this;
    }

    //kill existing tween
    this.scene.tweens.killTweensOf(this.blockedRing);
    this.scene.add.tween({
      targets: this.blockedRing,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.blockedRing.setActive(false).setVisible(false);
      },
    });

    return this;
  }

  pauseRotation() {
    this.paused = true;

    if (this.inOrbitView) this.rotationTween.pause();
    return this;
  }

  resumeRotation() {
    this.paused = false;
    if (!this.fleets.length) return;
    if (this.inOrbitView) this.rotationTween.resume();
    return this;
  }

  spawn() {
    this.scene.add.existing(this);
    return this;
  }

  setActive(value: boolean): this {
    if (value) {
      if (!this.paused) this.rotationTween.play();
    } else {
      this.rotationTween.pause();
    }

    super.setActive(value);

    return this;
  }

  update() {
    if (this.inOrbitView) return;

    this.setScale(1 / this._scene.camera.phaserCamera.zoom);
  }

  destroy() {
    this.clearOrbit(true);
    this.rotationTween.destroy();
    super.destroy();
  }
}
