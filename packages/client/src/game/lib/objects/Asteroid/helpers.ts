import { EntityTypeToSecondaryAsteroidSpriteKey, LevelToPrimaryAsteroidSpriteKey } from "../../mappings";
import { Entity } from "@latticexyz/recs";

const MaxLevelToAsteroidSpriteSize: Record<number, string> = {
  1: "Small",
  2: "Small",
  3: "Medium",
  4: "Medium",
  5: "Medium",
  6: "Medium",
  7: "Medium",
  8: "Large",
};

// const rockRelationsips = ["Neutral", "Ally", "Enemy", "Self"] as const;
// export type RockRelationship = (typeof rockRelationsips)[number];

export const getPrimarySprite = (level: bigint) => {
  return LevelToPrimaryAsteroidSpriteKey[Number(level)];
};

export const getSecondarySprite = (resourceType: Entity, maxLevel: bigint) => {
  const key = `${resourceType}${MaxLevelToAsteroidSpriteSize[Number(maxLevel)]}`;
  return EntityTypeToSecondaryAsteroidSpriteKey[key];
};

// export const getOutlineSprite = (rockRelationship: RockRelationship) => {
//   return SpriteKeys[`Asteroid${rockRelationship}` as keyof typeof SpriteKeys];
// };

// export const getSecondaryOutlineSprite = (rockRelationship: RockRelationship, maxLevel: BigUint64Array) => {
//   return SpriteKeys[`Motherlode${rockRelationship}${maxLevelToSize[Number(maxLevel)]}` as keyof typeof SpriteKeys];
// };
