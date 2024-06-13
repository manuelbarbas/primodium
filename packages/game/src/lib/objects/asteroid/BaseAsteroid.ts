import Phaser from "phaser";
import { Coord } from "@primodiumxyz/engine/types";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { Entity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/api/scene";
import { IPrimodiumGameObject } from "@/lib/objects/interfaces";
import { FleetsContainer } from "@/lib/objects/asteroid/FleetsContainer";
import { AsteroidLabel } from "@/lib/objects/asteroid/AsteroidLabel";
import { isValidClick, isValidHover } from "@/lib/objects/inputGuards";
import { DeferredAsteroidsRenderContainer } from "@/lib/objects/asteroid/DeferredAsteroidsRenderContainer";
import { LODs } from "@/lib/objects/asteroid/helpers";
import { DepthLayers } from "@/lib/constants/common";

interface LODConfig {
  asteroidAlpha: number;
  asteroidLabelPosition: { x: number; y: number };
  asteroidLabelAlpha: number;
  ownerLabelAlpha: number;
  fleetContainerAlpha: number;
  setup: () => void;
}

export abstract class BaseAsteroid extends Phaser.GameObjects.Zone implements IPrimodiumGameObject {
  private circle: Phaser.GameObjects.Arc;
  private animationTween: Phaser.Tweens.Tween;
  private interactiveCircle;

  id: Entity;
  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected fleetsContainer: FleetsContainer;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Sprite;
  protected asteroidLabel: AsteroidLabel;
  protected currentLOD = -1;

  //fx
  private fireSeq?: Phaser.Time.Timeline;
  private laser?: Phaser.GameObjects.Particles.ParticleEmitter;

  private lastClickTime = 0;
  private singleClickTimeout?: Phaser.Time.TimerEvent;

  constructor(args: {
    id: Entity;
    scene: PrimodiumScene;
    coord: Coord;
    sprite: Sprites;
    outlineSprite: Sprites;
    containerId?: Entity;
    cull?: boolean;
  }) {
    const { id, scene, coord, sprite, containerId, cull = true } = args;
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

    let fleetsContainer;
    // providing a containerId means that the rendering currently happening was deferred
    // we currently don't need it afterwards
    if (containerId) {
      const renderContainer = scene.objects.deferredRenderContainer.getContainer(containerId) as
        | DeferredAsteroidsRenderContainer
        | undefined;
      fleetsContainer = renderContainer?.getFleetsContainers(id);
    }
    this.fleetsContainer = fleetsContainer ?? new FleetsContainer(scene, { x: pixelCoord.x, y: -pixelCoord.y });

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
    this._scene.objects.asteroid.add(id, this, cull);
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

      // Clear any existing timeout
      if (this.singleClickTimeout) {
        this.singleClickTimeout.destroy();
        this.singleClickTimeout = undefined;
      }

      // Set a new timeout for single-click
      this.singleClickTimeout = this.scene.time.delayedCall(200, () => {
        fn(e);
        this.singleClickTimeout = undefined;
      });
    });
    return this;
  }

  onDoubleClick(fn: (e: Phaser.Input.Pointer) => void, onSprite = false) {
    const obj = onSprite ? this.asteroidSprite.setInteractive() : this.circle;
    obj.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer) => {
      if (!isValidClick(e)) return;

      const clickDelay = this.scene.time.now - this.lastClickTime;
      this.lastClickTime = this.scene.time.now;
      if (clickDelay < 200) {
        // If double-click, clear the single-click timeout
        if (this.singleClickTimeout) {
          this.singleClickTimeout.destroy();
          this.singleClickTimeout = undefined;
        }
        fn(e);
      }
    });
    return this;
  }

  onHoverEnter(fn: (e: Phaser.Input.Pointer) => void, onSprite = false) {
    const obj = onSprite ? this.asteroidSprite : this.circle;
    obj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, (e: Phaser.Input.Pointer) => {
      if (!isValidHover(e)) return;
      fn(e);
    });
    return this;
  }

  onHoverExit(fn: (e: Phaser.Input.Pointer) => void, onSprite = false) {
    const obj = onSprite ? this.asteroidSprite : this.circle;
    obj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, (e: Phaser.Input.Pointer) => {
      fn(e);
    });
    return this;
  }

  setOutline(value = 0x00ffff) {
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

  setPosition(x: number, y: number) {
    // bail out if it's the super
    if (this.id === undefined) return super.setPosition(x, y);

    this.asteroidSprite.setPosition(x, y);
    this.circle.setPosition(x, y);
    this.fleetsContainer.setPosition(x, y);
    this.asteroidLabel.setPosition(x, y);
    return super.setPosition(x, y);
  }

  setTilePosition(coord: Coord) {
    this.coord = coord;
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    return this.setPosition(pixelCoord.x, -pixelCoord.y);
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

  getFleetsContainer() {
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

  private _setLOD(level: LODs, noAnim = false): void {
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
