import { EntityID } from "@latticexyz/recs";
import { hashKeyEntityAndTrim } from "./encode";
import {
  Item,
  RequiredResources,
} from "src/network/components/chainComponents";

export type ResourceCostData = {
  name: string;
  id: EntityID;
  description?: string;
  resources: {
    id: EntityID;
    amount: number;
  }[];
};

// building a building requires resources
// fetch directly from component data
export function getRecipe(entityId: EntityID): ResourceCostData["resources"] {
  const requiredResources = RequiredResources.get(entityId)?.value;

  if (!requiredResources) return [];
  return requiredResources.map((resourceId: EntityID) => {
    // remove leading zeros due to mudv1 hashing behavior
    const resourceEntity = hashKeyEntityAndTrim(
      resourceId,
      entityId
    ) as EntityID;
    const resourceCost = Item.get(resourceEntity);

    return {
      id: resourceId,
      amount: resourceCost ? parseInt(resourceCost!.value.toString()) : -1,
    };
  });
}
