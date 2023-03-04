import { useComponentValue } from "@latticexyz/react";
import { Component, EntityID, Type } from "@latticexyz/recs";
import { useAccount } from "wagmi";
import { useMud } from "../context/MudContext";

export default function useResourceCount(
  resourceComponent: Component<
    { value: Type.Number },
    { contractId: string },
    undefined
  >
) {
  const { world, singletonIndex } = useMud();
  const { address } = useAccount();

  const resource = useComponentValue(
    resourceComponent,
    address
      ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)
      : singletonIndex
  );

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
