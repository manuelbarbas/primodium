import { useComponentValue } from "./useComponentValue";
import { Component, EntityID, EntityIndex, Type } from "@latticexyz/recs";

import { useAccount } from "../hooks/useAccount";
import { useMud } from "./useMud";
import { hashKeyEntityAndTrim } from "../util/encode";

export default function useResourceCount(
  resourceComponent: Component<
    { value: Type.Number },
    { contractId: string },
    undefined
  >,
  resourceId: EntityID,
  entityIndex?: EntityIndex
) {
  const { world, singletonIndex } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  let resourceKey = singletonIndex;
  if (entityIndex && world.entities.length > entityIndex) {
    const encodedEntityId = hashKeyEntityAndTrim(
      resourceId,
      world.entities[entityIndex]
    ) as EntityID;
    resourceKey = world.entityToIndex.get(encodedEntityId)!;
  } else if (address) {
    const encodedEntityId = hashKeyEntityAndTrim(
      resourceId,
      address
    ) as EntityID;
    resourceKey = world.entityToIndex.get(
      encodedEntityId.toString().toLowerCase() as EntityID
    )!;
  }

  const resource = useComponentValue(resourceComponent, resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
