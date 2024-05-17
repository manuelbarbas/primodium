import Phaser from "phaser";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { IPrimodiumGameObject } from "../interfaces";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { AsteroidLabel } from "@/game/lib/objects/Asteroid/AsteroidLabel";
import { Entity } from "@latticexyz/recs";
import { isValidClick } from "@/game/lib/objects/inputGuards";
import { LODs } from "@/game/lib/objects/Asteroid/helpers";
import { DepthLayers } from "@/game/lib/constants/common";

interface LODConfig {
  asteroidAlpha: number;
  asteroidLabelPosition: { x: number; y: number };
  asteroidLabelAlpha: number;
  ownerLabelAlpha: number;
  fleetContainerAlpha: number;
  setup: () => void;
}

export abstract class BaseAsteroid extends Phaser.GameObjects.Zone implements IPrimodiumGameObject {
  private id: Entity;
  private circle: Phaser.GameObjects.Arc;
  private animationTween: Phaser.Tweens.Tween;
  private interactiveCircle;
  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Sprite;
  protected asteroidLabel: AsteroidLabel;
  protected fleetsContainer: FleetsContainer;
  protected currentLOD: number = -1;

  //fx
  private fireSeq?: Phaser.Time.Timeline;
  private laser?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord; sprite: Sprites; outlineSprite: Sprites }) {
    const { id, scene, coord, sprite } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);

    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;

    this.asteroidSprite = new Phaser.GameObjects.Sprite(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y,
      Assets.SpriteAtlas,
      sprite
    ).setDepth(DepthLayers.Rock);

    this.asteroidLabel = new AsteroidLabel({
      scene,
      coord: { x: pixelCoord.x, y: -pixelCoord.y },
    });

    this.interactiveCircle = this.circle = new Phaser.GameObjects.Arc(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y,
      2,
      0,
      360,
      false,
      0xffff00,
      0.4
    )
      .setInteractive(new Phaser.Geom.Circle(0, 0, this.asteroidSprite.width / 4), Phaser.Geom.Circle.Contains)
      .disableInteractive()
      .setDepth(0);

    this.fleetsContainer = new FleetsContainer(scene, { x: pixelCoord.x, y: -pixelCoord.y });

    this.coord = coord;
    this._scene = scene;

    this.animationTween = this.scene.add.tween({
      targets: [this.asteroidSprite],
      y: "-=6",
      duration: 3 * 1000,
      repeat: -1,
      yoyo: true,
      paused: true,
    });

    // Add to object manager
    this._scene.objects.asteroid.add(id, this, true);
  }

  spawn() {
    // Add the individual objects to the scene
    this.scene.add.existing(this);
    this.scene.add.existing(this.asteroidSprite);
    this.scene.add.existing(this.circle);
    this.scene.add.existing(this.asteroidLabel);
    this.scene.add.existing(this.fleetsContainer);
    this.spawned = true;
    return this;
  }

  onClick(fn: (e: Phaser.Input.Pointer) => void, onSprite = false) {
    const obj = onSprite ? this.asteroidSprite.setInteractive() : this.circle;
    obj.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer) => {
      if (!isValidClick(e)) return;
      fn(e);
    });
    return this;
  }

  onHoverEnter(fn: (e: Phaser.Input.Pointer) => void) {
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, fn);
    return this;
  }

  onHoverExit(fn: (e: Phaser.Input.Pointer) => void) {
    this.circle.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, fn);
    return this;
  }

  setOutline(value: number = 0x00ffff) {
    this.asteroidSprite.postFX?.addGlow(value);
  }

  removeOutline() {
    this.asteroidSprite.postFX?.clear();
  }

  setActive(value: boolean): this {
    if (value) {
      this.animationTween.play();
      this.circle.setInteractive();
      const zoom = this._scene.camera.phaserCamera.zoom;
      this._setLOD(this.getLod(zoom), true);
      this.fleetsContainer.updateView();
      //set all objects to active
    } else {
      this.animationTween.pause();
      this.circle.disableInteractive();
    }

    this.fleetsContainer.setActive(value);
    this.circle.setActive(value);
    this.asteroidSprite.setActive(value);
    this.asteroidLabel.setActive(value);

    return super.setActive(value);
  }

  setVisible(value: boolean): this {
    this.fleetsContainer.setVisible(value);
    this.circle.setVisible(value);
    this.asteroidSprite.setVisible(value);
    this.asteroidLabel.setVisible(value);

    return super.setVisible(value);
  }

  setScale(x?: number, y?: number) {
    this.asteroidSprite.setScale(x, y);
    return this;
  }

  setTilePosition(coord: Coord) {
    this.coord = coord;
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    this.asteroidSprite.setPosition(pixelCoord.x, -pixelCoord.y);
    this.circle.setPosition(pixelCoord.x, -pixelCoord.y);
    this.fleetsContainer.setPosition(pixelCoord.x, -pixelCoord.y);
    this.asteroidLabel.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  getPixelCoord() {
    if (this.parentContainer) {
      const container = this.parentContainer;
      const matrix = container.getWorldTransformMatrix();
      return matrix.transformPoint(this.x, this.y);
    }
    return { x: this.x, y: this.y };
  }

  getCoord() {
    return this.coord;
  }

  getFleetContainer() {
    return this.fleetsContainer;
  }

  getAsteroidLabel() {
    return this.asteroidLabel;
  }

  fireAt(coord: Coord = { x: 0, y: 0 }) {
    if (this.fireSeq) return;

    const targetAngle = Phaser.Math.RadToDeg(Math.atan2(coord.y - this.y, coord.x - this.x)) - 90;

    // Ensure always rotating clockwise
    // while (targetAngle <= 0) {
    //   targetAngle += 360;
    // }

    this.fireSeq = this.scene.add
      .timeline([
        {
          at: 0,
          run: () => {
            this._scene.audio.play("SingleBlaster", "sfx");
            this._scene.camera.phaserCamera.shake(300, 0.001);

            this.laser = this.scene.add
              .particles(this.x, this.y, "flares", {
                lifespan: 250,
                frequency: 300 / 3,
                duration: 300,
                speed: { min: 100, max: 200 },
                tintFill: true,
                maxParticles: 10,
                // follow: this,
                angle: targetAngle + 90,

                color: [0xc7e5fd, 0x0ecaff, 0x00207d, 0x0ecaff],
                scale: { start: 0.1, end: 0.1 },
                alpha: { start: 1, end: 0.75 },
                quantity: 20,
                blendMode: "ADD",
              })
              .setDepth(DepthLayers.Path)
              .start();
          },
        },
        {
          at: 500,
          run: () => {
            this._scene.fx.emitExplosion(coord, "lg");
            this.laser?.destroy();
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

  update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.asteroidLabel.update();
    this.fleetsContainer.update();
    this.circle.setScale(1 / zoom);
    this._setLOD(this.getLod(zoom));
  }

  destroy() {
    this.animationTween.destroy();
    this.asteroidSprite.destroy();
    this.circle.destroy();
    this.asteroidLabel.destroy();
    this.fleetsContainer.destroy();
    this.laser?.destroy();
    this.fireSeq?.destroy();
    this._scene.objects.asteroid.remove(this.id);
    super.destroy();
  }

  // Tells the asteroid how to behave at different zoom levels
  abstract getLod(zoom: number): LODs;

  // PRIVATE METHODS

  private _setLOD(level: LODs, noAnim: boolean = false): void {
    if (this.currentLOD === level) return;

    this.currentLOD = level;
    const config: LODConfig = this._getLODConfig(level);

    if (noAnim) {
      this._applyLODConfigImmediately(config);
    } else {
      this._applyLODConfigWithAnimation(config);
    }
  }

  private _applyLODConfigImmediately(config: LODConfig): void {
    config.setup();
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(this.coord);
    this.asteroidSprite.alpha = config.asteroidAlpha;
    this.asteroidLabel.alpha = config.asteroidLabelAlpha;
    this.asteroidLabel.ownerLabel.setAlpha(config.ownerLabelAlpha);
    this.fleetsContainer.setAlpha(config.fleetContainerAlpha);
    this.asteroidLabel.setPosition(
      pixelCoord.x + config.asteroidLabelPosition.x,
      -pixelCoord.y + config.asteroidLabelPosition.y
    );
  }

  private _applyLODConfigWithAnimation(config: LODConfig): void {
    config.setup();
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(this.coord);

    this.scene.add.tween({
      targets: [this.asteroidSprite],
      alpha: config.asteroidAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel,
      alpha: config.asteroidLabelAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel.ownerLabel,
      alpha: config.ownerLabelAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.fleetsContainer,
      alpha: config.fleetContainerAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel,
      x: pixelCoord.x + config.asteroidLabelPosition.x,
      y: -pixelCoord.y + config.asteroidLabelPosition.y,
      duration: 200,
    });
  }

  private _getLODConfig(level: LODs): LODConfig {
    switch (level) {
      case LODs.FullyShow:
        return {
          asteroidAlpha: 1,
          asteroidLabelPosition: { x: this.asteroidSprite.displayWidth / 2, y: -this.asteroidSprite.displayHeight / 2 },
          asteroidLabelAlpha: 1,
          ownerLabelAlpha: 0.5,
          fleetContainerAlpha: 1,
          setup: () => {
            this.fleetsContainer.setAlpha(0);
            this.fleetsContainer.setOrbitView();
          },
        };
      case LODs.ShowLabelOnly:
        return {
          asteroidAlpha: 0,
          asteroidLabelPosition: { x: 0, y: 0 },
          asteroidLabelAlpha: 1,
          ownerLabelAlpha: 0.5,
          fleetContainerAlpha: 1,
          setup: () => {
            this.fleetsContainer.setAlpha(0);
            this.fleetsContainer.setInlineView();
          },
        };
      case LODs.HideAsteroidAndOwnerLabel:
        return {
          asteroidAlpha: 0,
          asteroidLabelPosition: { x: 0, y: 0 },
          asteroidLabelAlpha: 1,
          ownerLabelAlpha: 0,
          fleetContainerAlpha: 0,
          setup: () => {
            this.fleetsContainer.setInlineView();
          },
        };
      case LODs.FullyHide:
        return {
          asteroidAlpha: 0,
          asteroidLabelPosition: { x: 0, y: 0 },
          asteroidLabelAlpha: 0,
          ownerLabelAlpha: 0,
          fleetContainerAlpha: 0,
          setup: () => {
            this.fleetsContainer.setInlineView();
          },
        };
      default:
        throw new Error("Invalid LOD level");
    }
  }
}
