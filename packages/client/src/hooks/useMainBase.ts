import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { decodeCoordEntity } from "src/util/encode";
import { useAccount } from "./useAccount";
import { useComponentValue } from "./useComponentValue";
import { useMud } from "./useMud";

export const useMainBaseCoord = () => {
  const mainBase = useMainBase();
  const coord = useMemo(() => {
    return mainBase ? decodeCoordEntity(mainBase.value) : undefined;
  }, [mainBase?.value]);

  return coord;
};

export const useMainBase = () => {
  const { world, singletonIndex, components } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  return useComponentValue(components.MainBaseInitialized, resourceKey);
};
