import { Entity } from "@latticexyz/recs";
import { ResourceType } from "@/lib/types";
import { useResourceCount } from "./useResourceCount";

/**
 * Checks if the specified resource has enough quantity or production rate.
 *
 * @param resource - The resource entity to check.
 * @param amount - The required amount or production rate.
 * @param spaceRock - The space rock entity associated with the resource.
 * @param resourceType - The type of resource to check (default: ResourceType.Resource).
 * @returns A boolean indicating whether the resource has enough quantity or production rate.
 */
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
