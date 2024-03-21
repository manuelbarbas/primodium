import { Coord, Scene } from "engine/types";
import { ISpawnable } from "../interfaces";
// import { OrbitRing } from "./OrbitRing";
import { Assets } from "../../constants/assets";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { SpriteKeys } from "../../constants/assets/sprites";
import { AsteroidRelationship } from "../../constants/common";

export abstract class BaseAsteroid extends Phaser.GameObjects.Container implements ISpawnable {
  protected coord: Coord;
  protected _scene: Scene;
  protected fleetCount = 0;
  protected asteroidSprite: Phaser.GameObjects.Sprite;
  protected outlineSprite: Phaser.GameObjects.Sprite;
  // protected emblemSprite: Phaser.GameObjects.Sprite;
  // protected asteroidLabel: Phaser.GameObjects.BitmapText;
  // protected orbitRing: OrbitRing;

  constructor(scene: Scene, coord: Coord, sprite: SpriteKeys, outlineSprite: SpriteKeys) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y + scene.tiled.tileHeight);

    this.outlineSprite = this.scene.add.sprite(0, 0, Assets.SpriteAtlas, outlineSprite);
    this.asteroidSprite = this.scene.add.sprite(0, 0, Assets.SpriteAtlas, sprite);
    this.coord = coord;
    this._scene = scene;
  }

  spawn() {
    this.add([
      this.asteroidSprite,
      // this.emblemSprite,
      // this.asteroidLabel,
      // this.orbitRing
    ]);
    this.scene.add.existing(this);
  }

  abstract setRelationship(relationship: AsteroidRelationship): void;

  dispose() {
    this.destroy();
  }
}
