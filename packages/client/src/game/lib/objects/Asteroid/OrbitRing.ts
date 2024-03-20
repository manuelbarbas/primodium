import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord, Scene } from "engine/types";
import { Fleet } from "../Fleet";

export class OrbitRing extends Phaser.GameObjects.Container {
  private _scene: Scene;
  private coord: Coord;
  private orbitRing: Phaser.GameObjects.Graphics;
  private fleetsContainer: Phaser.GameObjects.Container;
  private fleetCount = 0;
  constructor(scene: Scene, coord: Coord) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y + scene.tiled.tileHeight);
    this.orbitRing = scene.phaserScene.add.graphics();
    this.orbitRing.lineStyle(2, 0x34d399);
    this.orbitRing.strokeCircle(0, 0, 50);

    this.fleetsContainer = scene.phaserScene.add.container(0, 0);
    this.add([this.orbitRing, this.fleetsContainer]);
    this.coord = coord;
    this._scene = scene;
  }
  addOrbitingFleet() {
    const fleet = new Fleet(this._scene, this.coord);
    this.fleetsContainer.add(fleet);
    this.fleetCount++;
    return this;
  }
  removeOrbitingFleet() {
    this.fleetsContainer.remove(this.fleetsContainer.list[0]);
    this.fleetCount--;
    return this;
  }
  spawn() {
    this.scene.add.existing(this);
    return this;
  }
  dispose() {
    this.destroy();
  }
}
