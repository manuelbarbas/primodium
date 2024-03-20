import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord, Scene } from "engine/types";

export class Tile extends Phaser.GameObjects.Rectangle {
  private _scene: Scene;
  constructor(scene: Scene, coord: Coord, color: number, alpha: number) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y, scene.tiled.tileWidth, scene.tiled.tileHeight, color, alpha);

    this.setOrigin(0, 0);
    this._scene = scene;
  }

  spawn() {
    this.scene.add.existing(this);

    return this;
  }

  setCoordPosition(coord: Coord) {
    const { tileWidth, tileHeight } = this._scene.tiled;
    const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);
    this.setPosition(pixelCoord.x, -pixelCoord.y);
    return this;
  }

  dispose() {
    this.destroy();
  }
}
