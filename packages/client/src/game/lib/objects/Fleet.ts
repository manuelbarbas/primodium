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
  public particles: Phaser.GameObjects.Particles.ParticleEmitter;
  public fleetImage: Phaser.GameObjects.Image;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord }) {
    const { id, scene, coord } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;
    this._scene = scene;
    this.coord = coord;

    // Create fleet image
    this.fleetImage = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, Sprites.FleetPlayer);
    this.fleetImage.setScale(1).setInteractive().disableInteractive();
    this.frames = this.scene.anims.get(Animations.FleetPlayer).frames;
    this.currentRotationFrame = this.frames[0].textureFrame;

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

    this.add([this.particles, this.fleetImage]);
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

  setRelationship(value: Relationship) {
    switch (value) {
      case "Ally":
        this.fleetImage.setTint(0x00ff00);
        break;
      case "Enemy":
        this.fleetImage.setTint(0xff0000);
        break;
      case "Neutral":
      case "Self":
        this.fleetImage.clearTint();
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

  detach() {
    this.parentContainer?.remove(this);

    this.reset();

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
    const container = this.parentContainer;
    const matrix = container.getWorldTransformMatrix();
    const point = matrix.transformPoint(this.x, this.y);

    return { x: point.x, y: point.y };
  }

  setRotationFrame(angle: number) {
    const segmentWidth = 360 / this.frames.length;
    const index = Math.floor(((angle + segmentWidth / 2) % 360) / segmentWidth);
    const frame = this.frames[index].textureFrame;

    if (this.currentRotationFrame === frame) return this;

    this.fleetImage.setFrame(frame);
    this.currentRotationFrame = frame;
    return this;
  }

  reset() {
    this.setRotationFrame(0);
    this.fleetImage.setRotation(0);
    this.fleetImage.setScale(1);
    this.fleetImage.setAlpha(1);
    this.particles.setAngle(0);
    this.setScale(1);
    this.setRotation(0);
    // this.setActive(true).setVisible(true);

    return this;
  }

  getRotationFrameOffset() {
    const segmentWidth = 360 / this.frames.length;
    const index = this.frames.findIndex((frame) => frame.textureFrame === this.currentRotationFrame);

    return index * segmentWidth;
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
}
