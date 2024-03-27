import { Coord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Scene } from "engine/types";
import { IPrimodiumGameObject } from "./interfaces";
import { Assets } from "../constants/assets";
import { SpriteKeys } from "../constants/assets/sprites";
import { DepthLayers } from "../constants/common";

export class Fleet extends Phaser.GameObjects.Sprite implements IPrimodiumGameObject {
  private _scene: Scene;
  private coord: Coord;
  private spawned = false;
  constructor(scene: Scene, coord: Coord) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y + scene.tiled.tileHeight,
      Assets.SpriteAtlas,
      SpriteKeys.LightningCraft
    );
    this.setOrigin(0.5, 0.5)
      .setScale(0.5)
      .setDepth(DepthLayers.Marker - coord.y)
      .setInteractive();
    this._scene = scene;
    this.coord = coord;
  }

  spawn() {
    this.scene.add.existing(this);
    this.spawned = true;
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

  getTileCoord() {
    const container = this.parentContainer;
    const matrix = container.getWorldTransformMatrix();
    const point = matrix.transformPoint(this.x, this.y);

    return { x: point.x / this._scene.tiled.tileWidth, y: -point.y / this._scene.tiled.tileHeight };
  }

  dispose() {
    this.destroy();
  }
}
