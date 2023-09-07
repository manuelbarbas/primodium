import { EntityID } from "@latticexyz/recs";
import { useFullResourceCount } from "./useFullResourceCount";
import { ResourceType } from "src/util/constants";

export function useHasEnoughOfResource(
  resourceID: EntityID,
  amount: number,
  resourceType = ResourceType.Resource
) {
  const { resourceCount, resourcesToClaim, production, maxStorage } =
    useFullResourceCount(resourceID, resourceType);

  switch (resourceType) {
    case ResourceType.Resource:
      return resourceCount + resourcesToClaim >= amount;
    case ResourceType.ResourceRate:
      return production >= amount;
    case ResourceType.Utility:
      return maxStorage - (resourceCount + resourcesToClaim) >= amount;
    default:
      return false;
  }
}
