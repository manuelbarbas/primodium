import { EntityID } from "@latticexyz/recs";

export const DEFAULT_MAX_HEALTH = 1000;

export function getBuildingMaxHealth(tileId: EntityID) {
  if (tileId) {
    return DEFAULT_MAX_HEALTH;
  } else {
    return DEFAULT_MAX_HEALTH;
  }
}
