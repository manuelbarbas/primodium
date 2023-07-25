import { EntityID } from "@latticexyz/recs";
import {
  BuildingLevel,
  MaxLevel,
} from "src/network/components/chainComponents";
export function canBeUpgraded(
  buildingEntity: EntityID,
  buildingType: EntityID
): undefined | boolean {
  return MaxLevel.has(buildingType) && BuildingLevel.has(buildingEntity);
}
