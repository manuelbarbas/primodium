import { Coord, Scene } from "engine/types";
import { IPrimodiumGameObject } from "../interfaces";
// import { OrbitRing } from "./OrbitRing";
import { Assets } from "../../constants/assets";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { SpriteKeys } from "../../constants/assets/sprites";
import { AsteroidRelationship } from "../../constants/common";

export abstract class BaseAsteroid extends Phaser.GameObjects.Container implements IPrimodiumGameObject {
  protected coord: Coord;
  protected _scene: Scene;
  protected fleetCount = 0;
  protected spawned = false;
  protected asteroidSprite: Phaser.GameObjects.Image;
  protected outlineSprite: Phaser.GameObjects.Image;
  // protected emblemSprite: Phaser.GameObjects.Sprite;
  // protected asteroidLabel: Phaser.GameObjects.BitmapText;
  // protected orbitRing: OrbitRing;

  constructor(scene: Scene, coord: Coord, sprite: SpriteKeys, outlineSprite: SpriteKeys) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y);

    this.outlineSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, outlineSprite);
    this.asteroidSprite = new Phaser.GameObjects.Image(scene.phaserScene, 0, 0, Assets.SpriteAtlas, sprite);

    this.coord = coord;
    this._scene = scene;
    this.setSize(this.outlineSprite.width, this.outlineSprite.height).setInteractive();
    // this.checkVisibility();
    // scene.camera.worldView$.subscribe(() => this.checkVisibility());
  }

  // Method to check visibility and update the object's active and visible properties
  private checkVisibility() {
    const camera = this.scene.cameras.main;
    const bounds = this.getBounds();

    // Check if the asteroid's bounds overlap with the camera's visible area
    const isVisible = Phaser.Geom.Intersects.RectangleToRectangle(bounds, camera.worldView);

    this.setVisible(isVisible);
    this.setActive(isVisible);
  }

  spawn() {
    this.add([
      this.asteroidSprite,
      this.outlineSprite,
      // this.emblemSprite,
      // this.asteroidLabel,
      // this.orbitRing
    ]);
    this.spawned = true;
    this.scene.add.existing(this);
    return this;
  }

  isSpawned() {
    return this.spawned;
  }

  getCoord() {
    return this.coord;
  }

  abstract setRelationship(relationship: AsteroidRelationship): void;

  dispose() {
    this.destroy();
  }
}
