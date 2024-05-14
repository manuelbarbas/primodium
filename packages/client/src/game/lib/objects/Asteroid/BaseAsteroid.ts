import Phaser from "phaser";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { IPrimodiumGameObject } from "../interfaces";
// import { AsteroidRelationship } from "@/game/lib/constants/common";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { AsteroidLabel } from "@/game/lib/objects/Asteroid/AsteroidLabel";
import { Entity } from "@latticexyz/recs";
import { isValidClick } from "@/game/lib/objects/inputGuards";
import { ContainerLite } from "engine/objects";
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

export abstract class BaseAsteroid extends ContainerLite implements IPrimodiumGameObject {
  private id: Entity;
  private circle: Phaser.GameObjects.Arc;
  private animationTween: Phaser.Tweens.Tween;

  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Image;
  // protected outlineSprite: Phaser.GameObjects.Image;
  protected asteroidLabel: AsteroidLabel;
  protected fleetsContainer: FleetsContainer;
  protected currentLOD: number = -1;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord; sprite: Sprites; outlineSprite: Sprites }) {
    const { id, scene, coord, sprite } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;

    // this.outlineSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, outlineSprite);
    this.asteroidSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, sprite).setDepth(
      DepthLayers.Rock
    );
    this.asteroidLabel = new AsteroidLabel({
      scene,
      coord: { x: 0, y: 0 },
    });

    this.circle = new Phaser.GameObjects.Arc(scene.phaserScene, 0, 0, 2, 0, 360, false, 0xffff00, 0.4);
    this.fleetsContainer = new FleetsContainer(scene, { x: 0, y: 0 });

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

    this.circle.setInteractive(new Phaser.Geom.Circle(0, 0, 32), Phaser.Geom.Circle.Contains).disableInteractive();

    //add children to container
    this.addLocalMultiple([
      // point to indicate position during far zoom
      this.circle,
      // asteroid sprite
      this.asteroidSprite,
      // container lite for holding fleet objects
      this.fleetsContainer,
      // container lite for holding asteroid label and emblem objects
      this.asteroidLabel,
    ]);

    //add to object manager
    this._scene.objects.asteroid.add(id, this, true);
  }

  spawn() {
    this.spawned = true;
    this.scene.add.existing(this);
    this.addChildrenToScene();

    return this;
  }

  onClick(fn: (e: Phaser.Input.Pointer) => void) {
    this.circle.on(Phaser.Input.Events.POINTER_UP, (e: Phaser.Input.Pointer) => {
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

  setActive(value: boolean): this {
    super.setActive(value);

    if (value) {
      this.animationTween.play();
      this.circle.setInteractive();
    } else {
      this.animationTween.pause();
      this.circle.disableInteractive();
    }

    const zoom = this._scene.camera.phaserCamera.zoom;
    this._setLOD(this.getLod(zoom), true);

    return this;
  }

  setScale(x?: number, y?: number) {
    this.asteroidSprite.setScale(x, y);
    // this.outlineSprite.setScale(x, y);
    return this;
  }

  setTilePosition(coord: Coord) {
    this.coord = coord;
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    this.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }

  isSpawned() {
    return this.spawned;
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

  update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.asteroidLabel.update();
    this.fleetsContainer.update();
    this.circle.setScale(1 / zoom);
    this.setSize(32 / zoom, 32 / zoom);
    this._setLOD(this.getLod(zoom));
  }

  destroy() {
    this.animationTween.destroy();
    this._scene.objects.asteroid.remove(this.id);
    super.destroy();
  }

  // tells the asteroid how to behave at different zoom levels
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
    this.asteroidSprite.alpha = config.asteroidAlpha;
    this.asteroidLabel.alpha = config.asteroidLabelAlpha;
    this.asteroidLabel.ownerLabel.setAlpha(config.ownerLabelAlpha);
    this.fleetsContainer?.setAlpha(config.fleetContainerAlpha);
    this.setChildLocalPosition(this.asteroidLabel, config.asteroidLabelPosition.x, config.asteroidLabelPosition.y);
  }

  private _applyLODConfigWithAnimation(config: LODConfig): void {
    config.setup();

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

    this.fleetsContainer.tweenSelf({
      alpha: config.fleetContainerAlpha,
      duration: 200,
    });

    // this.scene.add.tween({
    //   targets: this.fleetsContainer,
    //   alpha: config.fleetContainerAlpha,
    //   delay: 1000,
    //   duration: 200,
    // });

    this.asteroidLabel.tweenSelf({
      x: config.asteroidLabelPosition.x,
      y: config.asteroidLabelPosition.y,
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
