import { Entity } from "@latticexyz/recs";
import { ResourceType } from "src/util/constants";
import { useFullResourceCount } from "./useFullResourceCount";

export function useHasEnoughOfResource(
  resource: Entity,
  amount: bigint,
  playerEntity: Entity,
  resourceType = ResourceType.Resource
) {
  const { resourceCount, resourcesToClaim, production } = useFullResourceCount(resource, playerEntity);
  switch (resourceType) {
    case ResourceType.Resource:
      return resourceCount + resourcesToClaim >= amount;
    case ResourceType.ResourceRate:
      return production >= amount;
    case ResourceType.Utility:
      return resourceCount >= amount;
    default:
      return false;
  }
}
