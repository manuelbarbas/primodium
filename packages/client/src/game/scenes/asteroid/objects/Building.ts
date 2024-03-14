import { Assets, EntityTypeToAnimationKey, EntityTypetoBuildingSpriteKey, SpriteKeys } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { safeIndex } from "src/util/array";

function getAnimationAsset(level: bigint, buildingType: Entity) {
  const animations = EntityTypeToAnimationKey[buildingType];
  const _level = Number(level);
  return animations ? safeIndex(_level - 1, animations) : undefined;
}

function getSpriteAsset(level: bigint, buildingType: Entity) {
  const sprites = EntityTypetoBuildingSpriteKey[buildingType];
  const _level = Number(level);
  return sprites ? safeIndex(_level - 1, sprites) : SpriteKeys.IronMine1;
}

function getAssetKeyPair(level: bigint, buildingType: Entity) {
  const spriteKey = getSpriteAsset(level, buildingType);
  const animationKey = getAnimationAsset(level, buildingType);

  return {
    sprite: spriteKey,
    animation: animationKey,
  };
}

export class Building extends Phaser.GameObjects.Sprite {
  private buildingType: Entity;
  private coord: Coord;
  constructor(scene: Phaser.Scene, buildingType: Entity, coord: Coord) {
    console.log("Building", buildingType, coord);
    const assetPair = getAssetKeyPair(1n, buildingType);
    super(scene, coord.x, coord.y, Assets.SpriteAtlas, assetPair.sprite);
    assetPair.animation && this.play(assetPair.animation);

    this.buildingType = buildingType;
    this.coord = coord;
  }

  spawn() {
    //TODO: placement animation
    this.scene.add.existing(this);
  }

  despawn() {
    //TODO: despawn animation
    this.destroy();
  }

  setLevel(level: number) {
    const assetPair = getAssetKeyPair(BigInt(level), this.buildingType);
    this.setTexture(Assets.SpriteAtlas, assetPair.sprite);
    //TODO: level up animation
    assetPair.animation && this.play(assetPair.animation);
  }

  setOutline = (color: number, thickness: number, knockout = false) => {
    this.postFX.addGlow(color, thickness, undefined, knockout);
  };

  clearOutline = () => {
    this.postFX.clear();
  };
}
