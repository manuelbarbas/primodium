import Phaser from "phaser";
import { Coord } from "engine/types";
import { PrimodiumScene } from "@/game/api/scene";
import { IPrimodiumGameObject } from "../interfaces";
import { FleetsContainer } from "@/game/lib/objects/Asteroid/FleetsContainer";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { AsteroidLabel } from "@/game/lib/objects/Asteroid/AsteroidLabel";
import { Entity } from "@latticexyz/recs";
import { isValidClick } from "@/game/lib/objects/inputGuards";
import { DeferredAsteroidsRenderContainer } from "@/game/lib/objects/Asteroid/DeferredAsteroidsRenderContainer";
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
  private circle: Phaser.GameObjects.Arc;
  private animationTween: Phaser.Tweens.Tween;

  protected id: Entity;
  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected fleetsContainer: FleetsContainer;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Sprite;
  protected asteroidLabel: AsteroidLabel;
  protected currentLOD: number = -1;

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

    this.circle = new Phaser.GameObjects.Arc(
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
      .setInteractive(new Phaser.Geom.Circle(0, 0, 32), Phaser.Geom.Circle.Contains)
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
    if (value) {
      this.animationTween.play();
      this.circle.setInteractive();
      const zoom = this._scene.camera.phaserCamera.zoom;
      this._setLOD(this.getLod(zoom), true);
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

  getCoord() {
    return this.coord;
  }

  getFleetsContainer() {
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
    this._setLOD(this.getLod(zoom));
  }

  destroy() {
    this.animationTween.destroy();
    this.asteroidSprite.destroy();
    this.circle.destroy();
    this.asteroidLabel.destroy();
    this.fleetsContainer.destroy();
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
