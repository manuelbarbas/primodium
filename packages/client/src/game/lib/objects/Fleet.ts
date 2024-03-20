import { Coord, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Scene } from "engine/types";
import { ISpawnable } from "./interfaces";
import { Assets } from "../constants/assets";
import { SpriteKeys } from "../constants/assets/sprites";
import { DepthLayers } from "../constants/common";

export class Fleet extends Phaser.GameObjects.Sprite implements ISpawnable {
  private _scene: Scene;
  private coord: Coord;
  constructor(scene: Scene, coord: Coord) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y + scene.tiled.tileHeight,
      Assets.SpriteAtlas,
      SpriteKeys.LightningCraft
    );
    this.setOrigin(0.5, 0.5);
    this.setDepth(DepthLayers.Marker - coord.y);
    this.setInteractive();
    this._scene = scene;
    this.coord = coord;
  }

  spawn() {
    this.scene.add.existing(this);
    return this;
  }

  dispose() {
    this.destroy();
  }
}
