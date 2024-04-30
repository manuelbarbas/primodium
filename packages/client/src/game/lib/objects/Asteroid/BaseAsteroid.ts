import { Coord, Scene } from "engine/types";
import { IPrimodiumGameObject } from "../interfaces";
// import { OrbitRing } from "./OrbitRing";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { AsteroidRelationship, DepthLayers } from "../../constants/common";
import { OrbitRing } from "./OrbitRing";
import { Assets, Sprites } from "@primodiumxyz/assets";
import { AsteroidLabel } from "@/game/lib/objects/Asteroid/AsteroidLabel";

export abstract class BaseAsteroid extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  protected coord: Coord;
  protected _scene: Scene;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Image;
  protected outlineSprite: Phaser.GameObjects.Image;
  protected asteroidLabel: AsteroidLabel;
  protected orbitRing: OrbitRing;

  constructor(args: { scene: Scene; coord: Coord; sprite: Sprites; outlineSprite: Sprites }) {
    const { scene, coord, sprite, outlineSprite } = args;
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.outlineSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, outlineSprite);
    this.asteroidSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, sprite);
    this.asteroidLabel = new AsteroidLabel({
      scene,
      coord: { x: 0, y: 0 },
    });
    this.orbitRing = new OrbitRing(scene, { x: 0, y: 0 });

    this.coord = coord;
    this._scene = scene;
    this.setSize(this.outlineSprite.width, this.outlineSprite.height).setInteractive();
    this.setDepth(DepthLayers.Rock);
  }

  spawn() {
    this.add([this.asteroidSprite, this.outlineSprite, this.orbitRing, this.asteroidLabel]);
    this.spawned = true;
    this.scene.add.existing(this);
    return this;
  }

  setScale(x?: number, y?: number) {
    this.asteroidSprite.setScale(x, y);
    this.outlineSprite.setScale(x, y);
    return this;
  }

  setTilePosition(coord: Coord) {
    this.coord = coord;
    const pixelCoord = tileCoordToPixelCoord(coord, this._scene.tiled.tileWidth, this._scene.tiled.tileHeight);
    this.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  getCoord() {
    return this.coord;
  }

  getOrbitRing() {
    return this.orbitRing;
  }

  getAsteroidLabel() {
    return this.asteroidLabel;
  }

  abstract setRelationship(relationship: AsteroidRelationship): void;

  update() {
    this.orbitRing.update();

    const zoom = this._scene.camera.phaserCamera.zoom;

    if (zoom < 0.5) {
      // this.orbitRing.setActive(false).setVisible(false).pauseRotation();
      this.scene.add.tween({
        targets: [this.asteroidSprite, this.outlineSprite, this.orbitRing],
        alpha: 0,
        duration: 200,
        ease: "Linear",
      });
      this.scene.add.tween({
        targets: this.asteroidLabel,
        x: 0,
        y: 0,
        duration: 200,
        ease: "Linear",
      });
      // this.outlineSprite.alpha = 0;
      // this.orbitRing.alpha = 0;
    }

    if (zoom >= 0.5) {
      this.scene.add.tween({
        targets: [this.asteroidSprite, this.outlineSprite, this.orbitRing],
        alpha: 1,
        duration: 200,
        ease: "Linear",
      });
      this.scene.add.tween({
        targets: this.asteroidLabel,
        x: 32,
        y: -16,
        duration: 200,
        ease: "Linear",
      });
    }

    this.asteroidLabel.setScale(1 / zoom);
  }

  dispose() {
    this.destroy();
  }
}
