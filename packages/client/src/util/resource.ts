import { EntityID } from "@latticexyz/recs";
import {
  Motherlode,
  P_MotherlodeResource,
  P_RequiredResources,
  P_RequiredUtility,
} from "src/network/components/chainComponents";
import { BlockType, ResourceType } from "./constants";
import { hashKeyEntity } from "./encode";

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

  const resources = requiredResources.resources.map((resourceId: EntityID, index: number) => ({
    id: resourceId,
    type: ResourceType.Resource,
    amount: requiredResources.values[index],
  }));
  const utilities = requiredUtilities.resourceIDs.map((resourceId: EntityID, index: number) => ({
    id: resourceId,
    type: ResourceType.Utility,
    amount: requiredUtilities.requiredAmounts[index],
  }));
  return [...resources, ...utilities];
}

export const mineableResources = [BlockType.Titanium, BlockType.Iridium, BlockType.Platinum, BlockType.Kimberlite];

export function getMotherlodeResource(entityID: EntityID) {
  const motherlode = Motherlode.get(entityID);
  if (!motherlode) return;
  const motherlodeType = hashKeyEntity(motherlode.motherlodeType, motherlode.size);
  return P_MotherlodeResource.get(motherlodeType);
}
