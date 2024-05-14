import Phaser from "phaser";
import { PrimodiumScene } from "@/game/api/scene";
import { IPrimodiumGameObject } from "./interfaces";
import { TransitLine } from "./TransitLine";
import { Assets, Sprites, Animations } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";
import { Coord } from "engine/types";
import { DepthLayers } from "@/game/lib/constants/common";
// import { ContainerLite } from "engine/objects";

export class Fleet extends Phaser.GameObjects.Image implements IPrimodiumGameObject {
  private _scene: PrimodiumScene;
  private id: Entity;
  private coord: Coord;
  private spawned = false;
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

    this.setDepth(DepthLayers.Resources);

    this._scene.objects.fleet.add(id, this);
  }

  spawn() {
    this.scene.add.existing(this);
    this.spawned = true;
    return this;
  }

  detach() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    this?.rexContainer?.parent?.resetChildState(this)?.remove(this);

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

    this.setFrame(frame);
    this.currentRotationFrame = frame;
    return this;
  }

  reset() {
    this.setRotationFrame(0);
    this.setRotation(0);
    this.setScale(1);
    this.setAlpha(1);
    this.setFlip(false, false);
    this.setActive(true).setVisible(true);

    return this;
  }

  getRotationFrameOffset() {
    const segmentWidth = 360 / this.frames.length;
    const index = this.frames.findIndex((frame) => frame.textureFrame === this.currentRotationFrame);

    return index * segmentWidth;
  }

  getTileCoord() {
    return { x: this.x / this._scene.tiled.tileWidth, y: -this.y / this._scene.tiled.tileHeight };
  }

  getTransitLine() {
    return this.transitLineRef;
  }

  setTransitLineRef(transitLine: TransitLine | null) {
    this.transitLineRef = transitLine;

    return this;
  }

  destroy() {
    //TODO: explosion effect
    this.detach();
    this._scene.objects.fleet.remove(this.id);
    this.particles.destroy();
    super.destroy();
  }
}
