import { EntityID } from "@latticexyz/recs";
import { Level, MaxLevel } from "src/network/components/chainComponents";
export function canBeUpgraded(
  buildingEntity: EntityID,
  buildingType: EntityID
): undefined | boolean {
  return MaxLevel.has(buildingType) && Level.has(buildingEntity);
}
