import { Entity } from "@latticexyz/recs";
import { Sprites } from "@primodiumxyz/assets";
import { EntityTypeToAnimations, EntityTypetoBuildingSprites } from "src/game/lib/mappings";
import { safeIndex } from "src/util/array";

export function getAnimationAsset(level: bigint, buildingType: Entity) {
  const animations = EntityTypeToAnimations[buildingType];
  const _level = Number(level);
  return animations ? safeIndex(_level - 1, animations) : undefined;
}

export function getSpriteAsset(level: bigint, buildingType: Entity) {
  const sprites = EntityTypetoBuildingSprites[buildingType];
  const _level = Number(level);
  return sprites ? safeIndex(_level - 1, sprites) : Sprites.IronMine1;
}

export function getAssetKeyPair(level: bigint, buildingType: Entity) {
  const spriteKey = getSpriteAsset(level, buildingType);
  const animationKey = getAnimationAsset(level, buildingType);

  return {
    sprite: spriteKey,
    animation: animationKey,
  };
}

export function getConstructionSprite(buildingDimensions: BuildingDimensions) {
  return Sprites[`Construction${buildingDimensions.height}x${buildingDimensions.width}` as keyof typeof Sprites] as
    | Sprites
    | undefined;
}
export type BuildingDimensions = {
  width: number;
  height: number;
};
