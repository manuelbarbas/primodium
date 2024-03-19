import { EntityTypeToAnimationKey, EntityTypetoBuildingSpriteKey, SpriteKeys } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { safeIndex } from "src/util/array";

export function getAnimationAsset(level: bigint, buildingType: Entity) {
  const animations = EntityTypeToAnimationKey[buildingType];
  const _level = Number(level);
  return animations ? safeIndex(_level - 1, animations) : undefined;
}

export function getSpriteAsset(level: bigint, buildingType: Entity) {
  const sprites = EntityTypetoBuildingSpriteKey[buildingType];
  const _level = Number(level);
  return sprites ? safeIndex(_level - 1, sprites) : SpriteKeys.IronMine1;
}

export function getAssetKeyPair(level: bigint, buildingType: Entity) {
  const spriteKey = getSpriteAsset(level, buildingType);
  const animationKey = getAnimationAsset(level, buildingType);

  return {
    sprite: spriteKey,
    animation: animationKey,
  };
}
export type BuildingDimensions = {
  width: number;
  height: number;
};
