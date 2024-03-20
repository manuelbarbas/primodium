import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BuildingDimensions, getConstructionSprite } from "./helpers";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ISpawnable } from "../interfaces";
import { DepthLayers } from "../../constants/common";
import { Assets } from "../../constants/assets";

export class BuildingConstruction extends Phaser.GameObjects.Container implements ISpawnable {
  private coord: Coord;
  private _scene: Scene;
  private sprite: Phaser.GameObjects.Sprite;
  private text: Phaser.GameObjects.BitmapText;

  constructor(scene: Scene, coord: Coord, buildingDimensions: BuildingDimensions, queueText?: string) {
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(scene.phaserScene, pixelCoord.x, -pixelCoord.y + scene.tiled.tileHeight);

    const spriteName = getConstructionSprite(buildingDimensions);
    if (!spriteName) console.warn("No construction sprite found for building dimensions: ", buildingDimensions);
    this.sprite = this.scene.add.sprite(0, 0, Assets.SpriteAtlas, spriteName);
    this.sprite.setOrigin(0, 1);
    this.sprite.setDepth(DepthLayers.Building - coord.y);
    this.sprite.setInteractive();

    this.text = this.scene.add
      .bitmapText(
        (scene.tiled.tileWidth * buildingDimensions.width) / 2,
        -(scene.tiled.tileHeight * buildingDimensions.height) / 2,
        "teletactile",
        queueText ?? undefined,
        14
      )
      .setTintFill(0x34d399)
      .setDepth(DepthLayers.Marker)
      .setOrigin(0.5);

    this.add([this.sprite, this.text]);

    this.coord = coord;
    this._scene = scene;
  }

  setQueueText(text: string) {
    this.text.setText(text);

    return this;
  }

  spawn() {
    //TODO: placement animation
    this.scene.add.existing(this);
    return this;
  }

  dispose() {
    this.destroy();
  }
}
