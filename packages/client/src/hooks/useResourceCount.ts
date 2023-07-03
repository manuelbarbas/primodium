import { useMemo } from "react";

import { useComponentValue } from "./useComponentValue";
import { Component, EntityID, EntityIndex, Type } from "@latticexyz/recs";

import { useAccount } from "../hooks/useAccount";
import { useMud } from "../context/MudContext";
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
  const resourceKey: EntityIndex = useMemo(() => {
    if (entityIndex && world.entities.length > entityIndex) {
      const encodedEntityId = hashKeyEntityAndTrim(
        resourceId,
        world.entities[entityIndex]
      ) as EntityID;
      return world.entityToIndex.get(encodedEntityId)!;
    } else if (address) {
      const encodedEntityId = hashKeyEntityAndTrim(
        resourceId,
        address
      ) as EntityID;
      return world.entityToIndex.get(
        encodedEntityId.toString().toLowerCase() as EntityID
      )!;
    } else {
      return singletonIndex;
    }
  }, [resourceId, entityIndex, address, singletonIndex, world]);

  const resource = useComponentValue(resourceComponent, resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
