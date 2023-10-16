import { Entity } from "@latticexyz/recs";
import { useFullResourceCount } from "./useFullResourceCount";
import { ResourceCategory } from "src/util/constants";

export function useHasEnoughOfResource(
  resource: Entity,
  amount: bigint,
  playerEntity: Entity,
  resourceType = ResourceCategory.Resource
) {
  const { resourceCount, resourcesToClaim, production, maxStorage } = useFullResourceCount(resource, playerEntity);

  switch (resourceType) {
    case ResourceCategory.Resource:
      return resourceCount + resourcesToClaim >= amount;
    case ResourceCategory.ResourceRate:
      return production >= amount;
    case ResourceCategory.Utility:
      return maxStorage - (resourceCount + resourcesToClaim) >= amount;
    default:
      return false;
  }
}
