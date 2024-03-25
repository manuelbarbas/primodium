import { SpriteKeys } from "../../constants/assets/sprites";
import { AsteroidRelationship } from "../../constants/common";
import {
  EntityTypeSizeToSecondaryAsteroidSpriteKey,
  LevelToPrimaryAsteroidSpriteKey,
  MaxLevelToAsteroidSpriteSize,
  RelationshipSizeToSecondaryAsteroidOutlineSpriteKey,
  RelationshipToPrimaryAsteroidOutlineSpriteKey,
} from "../../mappings";
import { Entity } from "@latticexyz/recs";

export const getPrimarySprite = (level: bigint) => {
  return LevelToPrimaryAsteroidSpriteKey[Number(level)];
};

export const getSecondarySprite = (resourceType: Entity, maxLevel: bigint) => {
  const size = MaxLevelToAsteroidSpriteSize[Number(maxLevel)];
  return EntityTypeSizeToSecondaryAsteroidSpriteKey[resourceType][size] ?? SpriteKeys.MotherlodeKimberliteSmall;
};

export const getPrimaryOutlineSprite = (rockRelationship: AsteroidRelationship) => {
  return RelationshipToPrimaryAsteroidOutlineSpriteKey[rockRelationship];
};

export const getSecondaryOutlineSprite = (relationship: AsteroidRelationship, maxLevel: bigint) => {
  const size = MaxLevelToAsteroidSpriteSize[Number(maxLevel)];
  return RelationshipSizeToSecondaryAsteroidOutlineSpriteKey[relationship][size] ?? SpriteKeys.MotherlodeNeutralSmall;
};
