import Phaser from "phaser";
import { Coord } from "@primodiumxyz/engine/types";
import { PrimodiumScene } from "@game/types";

export class Tile extends Phaser.GameObjects.Rectangle {
  private _scene: PrimodiumScene;
  constructor(scene: PrimodiumScene, coord: Coord, color: number, alpha: number) {
    const pixelCoord = scene.utils.tileCoordToPixelCoord(coord);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y, scene.tiled.tileWidth, scene.tiled.tileHeight, color, alpha);

    this.setOrigin(0, 0);
    this._scene = scene;
  }

  spawn() {
    this.scene.add.existing(this);

    return this;
  }

  setCoordPosition(coord: Coord) {
    const pixelCoord = this._scene.utils.tileCoordToPixelCoord(coord);
    this.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }

  override destroy() {
    this.destroy();
  }
}
