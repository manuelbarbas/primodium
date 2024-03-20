import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { getAssetKeyPair } from "./helpers";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Assets } from "../../constants/assets";
import { DepthLayers } from "../../constants/common";
import { ISpawnable } from "../interfaces";

export class Building extends Phaser.GameObjects.Sprite implements ISpawnable {
  private buildingType: Entity;
  private coord: Coord;
  private _scene: Scene;
  private level = 1n;
  constructor(scene: Scene, buildingType: Entity, coord: Coord) {
    const assetPair = getAssetKeyPair(1n, buildingType);
    const pixelCoord = tileCoordToPixelCoord(coord, scene.tiled.tileWidth, scene.tiled.tileHeight);
    super(
      scene.phaserScene,
      pixelCoord.x,
      -pixelCoord.y + scene.tiled.tileHeight,
      Assets.SpriteAtlas,
      assetPair.sprite
    );
    assetPair.animation && this.play(assetPair.animation);
    this.setOrigin(0, 1);
    this.setDepth(DepthLayers.Building - coord.y);
    this.setInteractive();

    this.buildingType = buildingType;
    this.coord = coord;
    this._scene = scene;
  }

  spawn() {
    //TODO: placement animation
    this.scene.add.existing(this);
    return this;
  }

  setCoordPosition(coord: Coord) {
    const pixelCoord = tileCoordToPixelCoord(coord, this._scene.tiled.tileWidth, this._scene.tiled.tileHeight);
    super.setPosition(pixelCoord.x, -pixelCoord.y + this._scene.tiled.tileHeight);
    this.coord = coord;
    return this;
  }

  setActive() {
    this.setTint(0xffffff);
    this.anims.resume();
    return this;
  }

  setInactive() {
    this.setTint(0x777777);
    this.anims.pause();
    return this;
  }

  setLevel(level: bigint) {
    this.level = level;
    const assetPair = getAssetKeyPair(level, this.buildingType);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
    //TODO: level up animation
    this.anims.stop();
    assetPair.animation && this.play(assetPair.animation);

    return this;
  }

  setBuildingType(buildingType: Entity) {
    this.buildingType = buildingType;
    const assetPair = getAssetKeyPair(this.level, buildingType);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
    this.anims.stop();
    assetPair.animation && this.play(assetPair.animation);
    return this;
  }

  setOutline = (color: number, thickness: number, knockout = false) => {
    this.postFX.addGlow(color, thickness, undefined, knockout);

    return this;
  };

  clearOutline = () => {
    this.postFX.clear();

    return this;
  };

  dispose() {
    //TODO: despawn animation
    this.destroy();
  }
}
