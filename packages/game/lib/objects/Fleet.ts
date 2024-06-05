import Phaser from "phaser";
import { PrimodiumScene } from "@/api/scene";
import { IPrimodiumGameObject } from "./interfaces";
import { Assets, Sprites, Animations } from "@primodiumxyz/assets";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@primodiumxyz/engine/types";
import { Relationship, DepthLayers } from "@/lib/constants/common";
import { isValidClick } from "@/lib/objects/inputGuards";
import { addCoords } from "@primodiumxyz/engine/lib/util/coords";

export class Fleet extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  readonly id: Entity;

  private _scene: PrimodiumScene;
  private coord: Coord;
  private spawned = false;
  private frames: Phaser.Animations.AnimationFrame[];
  private currentRotationFrame: string | number;
  private fleetImage: Phaser.GameObjects.Image;
  private particles: Phaser.GameObjects.Particles.ParticleEmitter;
  private fleetOverlay: Phaser.GameObjects.Image;
  private stanceIcon: Phaser.GameObjects.Image;

  //fx
  private fireSeq?: Phaser.Time.Timeline;
  private laser?: Phaser.GameObjects.Particles.ParticleEmitter;

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
      .setVisible(false)
      .setOrigin(0.5, 0.5);
    this.stanceIcon = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, Sprites.EMPTY)
      .setVisible(false)
      .setScale(0.25)
      .setDisplayOrigin(0, 72);

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

    this.add([this.particles, this.fleetImage, this.fleetOverlay, this.stanceIcon]);
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
    //normalize angle
    let angle = (degrees ?? 0) % 360;
    if (angle < 0) angle += 360;

    this._setRotationFrame(angle);
    super.setAngle(angle - this._getRotationFrameOffset());
    this.particles.angle = this._getRotationFrameOffset();
    this.stanceIcon.angle = -this.angle;

    return this;
  }

  getAngle(): number {
    return this.angle + this._getRotationFrameOffset();
  }

  setRotation(radians?: number | undefined): this {
    this.setAngle(Phaser.Math.RadToDeg(radians ?? 0));

    return this;
  }

  setRelationship(value: Relationship) {
    switch (value) {
      case "Ally":
        this.fleetOverlay.setVisible(true).setTintFill(0x00ff00).setAlpha(0.4);
        break;
      case "Enemy":
        this.fleetOverlay.setVisible(true).setTintFill(0xff0000).setAlpha(0.4);
        break;
      case "Neutral":
      case "Self":
        this.fleetOverlay.setVisible(false);
        break;
    }
  }

  setStanceIcon(icon: Sprites, show = true, anim = false) {
    this.stanceIcon.setFrame(icon);
    if (show) this.showStanceIcon(anim);
    return this;
  }

  showStanceIcon(anim = false) {
    this.stanceIcon.setVisible(true);

    if (!anim) return this;

    //kill existings tweens on stanceIcon
    this.scene.tweens.killTweensOf(this.stanceIcon);

    this.scene.tweens.add({
      targets: this.stanceIcon,
      alpha: 1,
      duration: 200,
      ease: "Linear",
      onStart: () => {
        this.stanceIcon.setAlpha(0);
      },
    });

    return this;
  }

  hideStanceIcon(anim = false) {
    if (!anim) {
      this.stanceIcon.setVisible(false);
      return this;
    }

    //kill existings tweens on stanceIcon
    this.scene.tweens.killTweensOf(this.stanceIcon);

    this.scene.tweens.add({
      targets: this.stanceIcon,
      alpha: 0,
      duration: 200,
      ease: "Linear",
      onComplete: () => {
        this.stanceIcon.setVisible(false);
      },
    });

    return this;
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

  setOutline(value = 0x00ffff) {
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

  fireAt(coord: Coord = { x: 0, y: 0 }) {
    if (this.fireSeq) return;

    let targetAngle = Phaser.Math.RadToDeg(Math.atan2(coord.y - this.y, coord.x - this.x)) - 90;
    const currentAngle = this.getAngle();

    // Ensure always rotating clockwise
    while (targetAngle <= currentAngle) {
      targetAngle += 360;
    }

    this.fireSeq = this.scene.add
      .timeline([
        {
          at: 0,
          run: () => {
            this._scene.audio.play("Whoosh", "sfx", { detune: -200, volume: 0.5 });

            this.scene.tweens.addCounter({
              from: currentAngle,
              to: targetAngle,
              duration: 500,
              yoyo: true,
              hold: 500,
              ease: "Quad.easeInOut",
              onUpdate: (tween) => {
                const val = tween.getValue();
                this.setAngle(val);
              },
            });
            this.scene.tweens.add({
              targets: this,
              scale: 1.2,
              duration: 500,
              hold: 500,
              yoyo: true,
              ease: "Quad.easeInOut",
            });
            this.scene.tweens.add({
              targets: this,
              x: [this.x, this.x - 4, this.x + 4],
              yoyo: true,
              duration: 500,
            });
            this.scene.tweens.add({
              targets: this,
              y: [this.y, this.y - 4, this.y + 4],
              yoyo: true,
              duration: 500,
            });
          },
        },
        {
          at: 500,
          run: () => {
            this._scene.audio.play("Blaster", "sfx");
            this._scene.camera.phaserCamera.shake(300, 0.001);

            this.laser = this.scene.add
              .particles(this.x, this.y, "flares", {
                lifespan: 500,
                frequency: 300 / 3,
                duration: 300,
                speed: { min: 100, max: 200 },
                tintFill: true,
                maxParticles: 10,
                // follow: this,
                angle: targetAngle + 90,

                color: [0xc7e5fd, 0x0ecaff, 0x00207d, 0x0ecaff],
                scale: { start: 0.1, end: 0.05 },
                alpha: { start: 1, end: 0.5 },
                quantity: 10,
                blendMode: "ADD",
              })
              .setDepth(DepthLayers.Path)
              .start();
          },
        },
        {
          at: 1000,
          run: () => {
            this._scene.fx.emitExplosion(coord, "sm");
            this.laser?.destroy();
          },
        },
        {
          at: 1200,
          run: () => {
            this._scene.fx.emitExplosion(addCoords({ x: -2, y: -4 }, coord), "sm");
          },
        },
        {
          at: 1400,
          run: () => {
            this._scene.fx.emitExplosion(addCoords({ x: 2, y: 4 }, coord), "md");
          },
        },
        {
          at: 1500,
          run: () => {
            this.fireSeq?.destroy();
            this.fireSeq = undefined;
          },
        },
      ])
      .play();
  }

  destroy(anim = false) {
    if (!anim) {
      this._scene.objects.fleet.remove(this.id);
      this.laser?.destroy();
      this.fireSeq?.destroy();
      super.destroy();
      return;
    }

    this.scene.add.tween({
      targets: this,
      alpha: 0,
      duration: 200,
      onStart: () => {
        this.setActive(false);
      },
      onComplete: () => {
        this._scene.objects.fleet.remove(this.id);
        this.laser?.destroy();
        this.fireSeq?.destroy();
        super.destroy();
      },
    });
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
