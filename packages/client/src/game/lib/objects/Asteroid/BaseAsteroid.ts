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
import { DeferredAsteroidRenderContainer } from "@/game/lib/render/renderDeferredAsteroid";

export type LODs = 0 | 1 | 2 | 3;

export abstract class BaseAsteroid extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  private id: Entity;
  protected coord: Coord;
  protected _scene: PrimodiumScene;
  protected fleetsContainer: FleetsContainer | undefined;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Image;
  // protected outlineSprite: Phaser.GameObjects.Image;
  protected asteroidLabel: AsteroidLabel;
  protected currentLOD: number = -1;
  private circle: Phaser.GameObjects.Arc;
  private animationTween: Phaser.Tweens.Tween;
  private deferred = false;

  constructor(args: { id: Entity; scene: PrimodiumScene; coord: Coord; sprite: Sprites; outlineSprite: Sprites }) {
    const { id, scene, coord, sprite } = args;
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.id = id;
    this.deferred = !!scene.objects.deferredRenderContainer.get(id);

    // this.outlineSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, outlineSprite);
    this.asteroidSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, sprite);
    this.asteroidLabel = new AsteroidLabel({
      scene,
      coord: { x: 0, y: 0 },
    });
    this.circle = new Phaser.GameObjects.Arc(scene.phaserScene, 0, 0, 2, 0, 360, false, 0xffff00, 0.4);
    this.fleetsContainer = this.deferred ? undefined : new FleetsContainer(scene, { x: 0, y: 0 });

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

    this._scene.objects.asteroid.add(id, this, true);
  }

  spawn() {
    this.add([this.circle, this.asteroidSprite, this.getFleetsContainer(), this.asteroidLabel]);
    this.spawned = true;
    this.scene.add.existing(this);
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
    this.setLOD(this.getLod(zoom), true);

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

  isDeferred() {
    return this.deferred;
  }

  getCoord() {
    return this.coord;
  }

  getFleetsContainer() {
    return (
      this.fleetsContainer ??
      (this._scene.objects.deferredRenderContainer.get(this.id) as DeferredAsteroidRenderContainer).getFleetsContainer()
    );
  }

  getAsteroidLabel() {
    return this.asteroidLabel;
  }

  // abstract setRelationship(relationship: AsteroidRelationship): void;
  abstract getLod(zoom: number): LODs;

  private setLOD(level: LODs, noAnim = false) {
    if (this.currentLOD === level) return;

    const fleetsContainer = this.getFleetsContainer();
    this.currentLOD = level;
    let asteroidAlpha = 1;
    let asteroidLabelPosition = { x: 0, y: 0 };
    let asteroidLabelAlpha = 1;
    let ownerLabelAlpha = 0.5;
    let fleetsContainerAlpha = 1;

    switch (level) {
      // LOD 0: Show asteroid and label
      case 0:
        asteroidAlpha = 1;
        asteroidLabelPosition = { x: this.asteroidSprite.displayWidth / 2, y: -this.asteroidSprite.displayHeight / 2 };
        this.asteroidLabel.removeFleetsContainer();
        this.add(fleetsContainer);
        fleetsContainer.setOrbitView();
        this.bringToTop(this.asteroidLabel);
        break;
      // LOD 1: Show asteroid only
      case 1:
        asteroidAlpha = 0;
        asteroidLabelPosition = { x: 0, y: 0 };
        this.asteroidLabel.attachFleetsContainer(fleetsContainer);
        fleetsContainer.setInlineView();
        this.bringToTop(this.asteroidLabel);
        break;
      // LOD 2: Hide asteroid and label
      case 2:
        asteroidAlpha = 0;
        asteroidLabelPosition = { x: 0, y: 0 };
        // asteroidLabelAlpha = 0;
        ownerLabelAlpha = 0;
        fleetsContainerAlpha = 0;
        // fleetsContainer.setInlineView();
        break;
      case 3:
        asteroidAlpha = 0;
        asteroidLabelPosition = { x: 0, y: 0 };
        asteroidLabelAlpha = 0;
        ownerLabelAlpha = 0;
        fleetsContainerAlpha = 0;
        // fleetsContainer.setInlineView();
        break;
      default:
        throw new Error("Invalid LOD level");
    }

    if (noAnim) {
      this.asteroidSprite.alpha = asteroidAlpha;
      this.asteroidLabel.alpha = asteroidLabelAlpha;
      this.asteroidLabel.ownerLabel.setAlpha(ownerLabelAlpha);
      this.asteroidLabel.fleetsContainer?.setAlpha(ownerLabelAlpha);
      this.asteroidLabel.setPosition(asteroidLabelPosition.x, asteroidLabelPosition.y);
      return;
    }

    this.scene.add.tween({
      targets: [this.asteroidSprite],
      alpha: asteroidAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel,
      alpha: asteroidLabelAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel.ownerLabel,
      alpha: ownerLabelAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: fleetsContainer,
      alpha: fleetsContainerAlpha,
      duration: 200,
    });

    this.scene.add.tween({
      targets: this.asteroidLabel,
      x: asteroidLabelPosition.x,
      y: asteroidLabelPosition.y,
      duration: 200,
    });
  }

  update() {
    const zoom = this._scene.camera.phaserCamera.zoom;
    this.asteroidLabel.update();
    this.circle.setScale(1 / zoom);
    this.setSize(32 / zoom, 32 / zoom);
    this.setLOD(this.getLod(zoom));

    // this.setInteractive(new Phaser.Geom.Circle(0, 0, 32 / zoom), Phaser.Geom.Circle.Contains);
  }

  destroy() {
    this.animationTween.destroy();
    this._scene.objects.asteroid.remove(this.id);
    super.destroy();
  }
}
