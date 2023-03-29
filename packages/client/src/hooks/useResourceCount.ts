import { useMemo } from "react";
import { useComponentValue } from "@latticexyz/react";
import { Component, EntityID, EntityIndex, Type } from "@latticexyz/recs";
import { useAccount } from "../hooks/useAccount";
import { useMud } from "../context/MudContext";

export default function useResourceCount(
  resourceComponent: Component<
    { value: Type.Number },
    { contractId: string },
    undefined
  >,
  entityIndex?: EntityIndex
) {
  const { world, singletonIndex } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceOwner = useMemo(() => {
    if (entityIndex) {
      return entityIndex;
    } else if (address) {
      return world.entityToIndex.get(
        address.toString().toLowerCase() as EntityID
      );
    } else {
      return singletonIndex;
    }
  }, []);

  const resource = useComponentValue(resourceComponent, resourceOwner);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
