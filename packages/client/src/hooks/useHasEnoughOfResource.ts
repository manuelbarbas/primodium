import { Entity } from "@latticexyz/recs";
import { useFullResourceCount } from "./useFullResourceCount";
import { ResourceType } from "src/util/constants";

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
