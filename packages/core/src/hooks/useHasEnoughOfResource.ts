import { Entity } from "@latticexyz/recs";
import { ResourceType } from "@/lib/types";
import { useResourceCount } from "./useResourceCount";

export function useHasEnoughOfResource(
  resource: Entity,
  amount: bigint,
  spaceRock: Entity,
  resourceType = ResourceType.Resource
) {
  const { resourceCount, production } = useResourceCount(resource, spaceRock);
  switch (resourceType) {
    case ResourceType.Resource:
      return resourceCount >= amount;
    case ResourceType.ResourceRate:
      return production >= amount;
    case ResourceType.Utility:
      return resourceCount >= amount;
    default:
      return false;
  }
}
