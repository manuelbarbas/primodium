import Phaser from "phaser";
import { PrimodiumScene } from "@/game/api/scene";
import { IPrimodiumGameObject } from "./interfaces";
import { Assets, Sprites, Animations } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { Relationship, DepthLayers } from "@/game/lib/constants/common";
import { isValidClick } from "@/game/lib/objects/inputGuards";

export class Fleet extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private _scene: PrimodiumScene;
  private id: Entity;
  private coord: Coord;
  private spawned = false;
  private frames: Phaser.Animations.AnimationFrame[];
  private currentRotationFrame: string | number;
  private fleetImage: Phaser.GameObjects.Image;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private fleetOverlay: Phaser.GameObjects.Image;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord }) {
    const { id, scene, coord } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;
    this._scene = scene;
    this.coord = coord;

    // Create fleet image
    this.fleetImage = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, Sprites.FleetPlayer);
    this.fleetOverlay = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, Sprites.FleetPlayer)
      .setAlpha(0)
      .setOrigin(0.5, 0.5);
    this.fleetImage.setScale(1).setInteractive().disableInteractive();
    this.frames = this.scene.anims.get(Animations.FleetPlayer).frames;
    this.currentRotationFrame = this.frames[0].textureFrame;
    this.setSize(this.fleetImage.width, this.fleetImage.height);

    // Create particles
    this.particles = new Phaser.GameObjects.Particles.ParticleEmitter(this.scene, 0, 0, "flares", {
      lifespan: 1000,
      speed: { min: 20, max: 25 },
      tintFill: true,
      color: [0xc7e5fd, 0x0ecaff, 0x00207d, 0x0ecaff],
      scale: { start: 0.2, end: 0 },
      angle: { min: -80, max: -100 },
      quantity: 1,
      blendMode: "ADD",
    }).setAlpha(0.27);

    this.add([this.particles, this.fleetImage, this.fleetOverlay]);
    this.setDepth(DepthLayers.Resources);

    this._scene.objects.fleet.add(id, this);
  }

  spawn() {
    this.scene.add.existing(this);
    this.fleetImage.setInteractive();
    this.spawned = true;
    return this;
  }

  setActive(value: boolean): this {
    if (value) {
      this.fleetImage.setInteractive();
      //set all objects to active
    } else {
      this.fleetImage.disableInteractive();
    }

    return super.setActive(value);
  }

  setAngle(degrees?: number): this {
    let angle = degrees ?? 0;
    if (angle < 0) angle += 360;
    this._setRotationFrame(angle);
    super.setAngle(angle - this._getRotationFrameOffset());
    this.particles.angle = this._getRotationFrameOffset();

    return this;
  }

  setRotation(radians?: number | undefined): this {
    this.setAngle(Phaser.Math.RadToDeg(radians ?? 0));

    return this;
  }

  setRelationship(value: Relationship) {
    switch (value) {
      case "Ally":
        this.fleetOverlay.setTintFill(0x00ff00).setAlpha(0.4);
        break;
      case "Enemy":
        this.fleetOverlay.setTintFill(0xff0000).setAlpha(0.4);
        break;
      case "Neutral":
      case "Self":
        this.fleetOverlay.setAlpha(0);
        break;
    }
  }

  onClick(fn: (e: Phaser.Input.Pointer) => void) {
    this.fleetImage.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer) => {
      if (!isValidClick(e)) return;
      fn(e);
    });
    return this;
  }

  onHoverEnter(fn: (e: Phaser.Input.Pointer) => void) {
    this.fleetImage.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, fn);
    return this;
  }

  onHoverExit(fn: (e: Phaser.Input.Pointer) => void) {
    this.fleetImage.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, fn);
    return this;
  }

  setOutline(value: number = 0x00ffff) {
    this.fleetImage.preFX?.addGlow(value);
  }

  removeOutline() {
    this.fleetImage.preFX?.clear();
  }

  detach() {
    this.parentContainer?.remove(this);

    return this;
  }

  despawn() {
    this.destroy();
    this.spawned = false;
    return this;
  }

  isSpawned(): boolean {
    return this.spawned;
  }

  getCoord() {
    return this.coord;
  }

  getPixelCoord() {
    if (this.parentContainer) {
      const container = this.parentContainer;
      const matrix = container.getWorldTransformMatrix();
      return matrix.transformPoint(this.x, this.y);
    }
    return { x: this.x, y: this.y };
  }

  reset() {
    this._setRotationFrame(0);
    // this.fleetImage.setRotation(0);
    // this.fleetImage.setScale(1);
    // this.fleetImage.setAlpha(1);
    this.particles.setAngle(0);
    this.setScale(1);
    this.setRotation(0);
    // this.setActive(true).setVisible(true);

    return this;
  }

  getTileCoord() {
    const container = this.parentContainer;
    const matrix = container.getWorldTransformMatrix();
    const point = matrix.transformPoint(this.x, this.y);

    return { x: point.x / this._scene.tiled.tileWidth, y: -point.y / this._scene.tiled.tileHeight };
  }

  activateBurn() {
    this.particles.setVisible(true).setActive(true).resume();
  }

  deactivateBurn() {
    this.particles.setVisible(false).setActive(false).pause();
  }

  destroy() {
    //TODO: explosion effect
    // this.detach();
    this._scene.objects.fleet.remove(this.id);
    super.destroy();
  }

  private _getRotationFrameOffset() {
    const segmentWidth = 360 / this.frames.length;
    const index = this.frames.findIndex((frame) => frame.textureFrame === this.currentRotationFrame);

    return index * segmentWidth;
  }

  private _setRotationFrame(angle: number) {
    const segmentWidth = 360 / this.frames.length;
    const index = Math.floor(((angle + segmentWidth / 2) % 360) / segmentWidth);
    const frame = this.frames[index].textureFrame;

    if (this.currentRotationFrame === frame) return this;

    this.fleetImage.setFrame(frame);
    this.fleetOverlay.setFrame(frame);
    this.currentRotationFrame = frame;
    return this;
  }
}
