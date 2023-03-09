import { createContext, ReactNode, useContext } from "react";
import { TxQueue } from "@latticexyz/network";
import { EntityIndex, World } from "@latticexyz/recs";

import { NetworkComponents } from "@latticexyz/std-client";
import { SystemTypes } from "contracts/types/SystemTypes";
import {
  defineComponents,
  defineOffChainComponents,
} from "../network/components";

interface MudContextInterface {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: NetworkComponents<ReturnType<typeof defineComponents>>;
  offChainComponents: ReturnType<typeof defineOffChainComponents>;
  singletonIndex: EntityIndex;
}

export const MudContext = createContext<MudContextInterface | null>(null);

const MudProvider = ({
  world,
  systems,
  components,
  offChainComponents,
  singletonIndex,
  children,
}: {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: NetworkComponents<ReturnType<typeof defineComponents>>;
  offChainComponents: ReturnType<typeof defineOffChainComponents>;
  singletonIndex: EntityIndex;
  children: ReactNode;
}) => {
  return (
    <MudContext.Provider
      value={{
        world,
        systems,
        components,
        offChainComponents,
        singletonIndex,
      }}
    >
      {children}
    </MudContext.Provider>
  );
};

export default MudProvider;

export function useMud() {
  const mudData = useContext(MudContext);
  if (!mudData) {
    throw new Error("Cannot use MudProvider without providing initial values");
  } else {
    return mudData;
  }
}
