import Phaser from "phaser";
import { PrimodiumScene } from "@/game/api/scene";
import { FleetsContainer } from "./Asteroid/FleetsContainer";
import { IPrimodiumGameObject } from "./interfaces";
import { TransitLine } from "./TransitLine";
import { Assets, Sprites, Animations } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";

export class Fleet extends Phaser.GameObjects.Image implements IPrimodiumGameObject {
  private _scene: PrimodiumScene;
  private id: Entity;
  private coord: Coord;
  private spawned = false;
  private orbitRingRef: FleetsContainer | null = null;
  private transitLineRef: TransitLine | null = null;
  private frames: Phaser.Animations.AnimationFrame[];
  private currentRotationFrame: string | number;
  public particles: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord }) {
    const { id, scene, coord } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y + scene.tiled.tileHeight,
      Assets.SpriteAtlas,
      Sprites.FleetPlayer
    );
    this.id = id;
    this.setOrigin(0.5, 0.5).setScale(1).setInteractive();
    this._scene = scene;
    this.coord = coord;
    this.frames = this.scene.anims.get(Animations.FleetPlayer).frames;
    this.currentRotationFrame = this.frames[0].textureFrame;
    this.particles = this.scene.add
      .particles(pixelCoord.x, -pixelCoord.y, "flares", {
        x: pixelCoord.x,
        y: -pixelCoord.y,
        lifespan: 1000,
        speed: { min: 20, max: 25 },
        tintFill: true,
        color: [0xc7e5fd, 0x0ecaff, 0x00207d, 0x0ecaff],
        scale: { start: 0.2, end: 0 },
        angle: { min: -80, max: -100 },
        quantity: 1,
        blendMode: "ADD",
      })
      .setAlpha(0.27);

    this._scene.objects.fleet.add(id, this);
  }

  spawn() {
    this.scene.add.existing(this);
    this.spawned = true;
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

    this.setFrame(frame);
    this.currentRotationFrame = frame;
    return this;
  }

  reset() {
    this.setRotationFrame(0);
    this.setFlip(false, false);
    this.rotation = 0;
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

  getOrbitRing() {
    return this.orbitRingRef;
  }

  getTransitLine() {
    return this.transitLineRef;
  }

  setOrbitRingRef(orbitRing: FleetsContainer | null) {
    this.orbitRingRef = orbitRing;

    return this;
  }

  setTransitLineRef(transitLine: TransitLine | null) {
    this.transitLineRef = transitLine;

    return this;
  }

  destroy() {
    this._scene.objects.fleet.remove(this.id);
    this.particles.destroy();
    super.destroy();
  }
}
