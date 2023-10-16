import { Entity } from "@latticexyz/recs";
import { useFullResourceCount } from "./useFullResourceCount";
import { ResourceTypes } from "src/util/constants";

export function useHasEnoughOfResource(
  resource: Entity,
  amount: bigint,
  playerEntity: Entity,
  resourceType = ResourceTypes.Resource
) {
  const { resourceCount, resourcesToClaim, production, maxStorage } = useFullResourceCount(resource, playerEntity);

  switch (resourceType) {
    case ResourceTypes.Resource:
      return resourceCount + resourcesToClaim >= amount;
    case ResourceTypes.ResourceRate:
      return production >= amount;
    case ResourceTypes.Utility:
      return resourceCount >= amount;
    default:
      return false;
  }
}
