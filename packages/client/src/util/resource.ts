import { EntityID } from "@latticexyz/recs";
import {
  P_RequiredResources,
  P_RequiredUtility,
} from "src/network/components/chainComponents";
import { ResourceType } from "./constants";

// building a building requires resources
// fetch directly from component data
export function getRecipe(entityId: EntityID) {
  const requiredResources = P_RequiredResources.get(entityId, {
    resources: [],
    values: [],
  });
  const requiredUtilities = P_RequiredUtility.get(entityId, {
    resourceIDs: [],
    requiredAmounts: [],
  });

  const resources = requiredResources.resources.map(
    (resourceId: EntityID, index: number) => ({
      id: resourceId,
      type: ResourceType.Resource,
      amount: requiredResources.values[index],
    })
  );
  const utilities = requiredUtilities.resourceIDs.map(
    (resourceId: EntityID, index: number) => ({
      id: resourceId,
      type: ResourceType.Utility,
      amount: requiredUtilities.requiredAmounts[index],
    })
  );
  return [...resources, ...utilities];
}
