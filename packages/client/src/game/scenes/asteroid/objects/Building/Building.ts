import { Assets, DepthLayers } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { BuildingDimensions, getAssetKeyPair } from "./helpers";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

export class Building extends Phaser.GameObjects.Sprite {
  private buildingType: Entity;
  private coord: Coord;
  constructor(scene: Scene, buildingType: Entity, buildingDimensions: BuildingDimensions, coord: Coord) {
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

    this.buildingType = buildingType;
    this.coord = coord;
  }

  spawn() {
    //TODO: placement animation
    this.scene.add.existing(this);
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
    const assetPair = getAssetKeyPair(level, this.buildingType);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
    //TODO: level up animation
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
