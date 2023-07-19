import { EntityID } from "@latticexyz/recs";
import { useComponentValue } from "./useComponentValue";
import { useMud } from "src/context/MudContext";
import { useAccount } from "./useAccount";
import { decodeCoordEntity } from "src/util/encode";

export const useMainBase = () => {
  const { world, singletonIndex, components } = useMud();
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = address
    ? world.entityToIndex.get(address.toString().toLowerCase() as EntityID)!
    : singletonIndex;

  // fetch the main base of the user based on address
  const mainBaseCoord = useComponentValue(
    components.MainBaseInitialized,
    resourceKey
  );

  if (!mainBaseCoord) return;

  const coord = decodeCoordEntity(mainBaseCoord.value);

  return coord;
};
