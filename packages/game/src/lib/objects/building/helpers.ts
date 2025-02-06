import { Animations, Sprites } from "@primodiumxyz/assets";
import { safeIndex } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityTypeToAnimations, EntityTypetoBuildingSprites } from "@game/lib/mappings";

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

export function getUpgradeAnimation(buildingDimensions: BuildingDimensions) {
  if (buildingDimensions.width === 1 && buildingDimensions.height === 1) {
    return { animation: Animations.Upgrade1x1, offset: { x: 33, y: 5 }, changeFrame: 12 };
  }

  const xWarp = buildingDimensions.width / 3;
  const yWarp = buildingDimensions.height / 3;

  return {
    animation: Animations.Upgrade3x3,
    warp: { x: xWarp, y: yWarp },
    offset: { x: 27 * xWarp, y: 23 * yWarp },
    changeFrame: 13,
  };
}
