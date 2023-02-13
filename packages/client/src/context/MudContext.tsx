import { createContext, ReactNode, useContext } from "react";
import { TxQueue } from "@latticexyz/network";
import { World } from "@latticexyz/recs";

import { SystemTypes } from "contracts/types/SystemTypes";
import { components as defaultComponents } from "..";

interface MudContextInterface {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof defaultComponents;
}

export const MudContext = createContext<MudContextInterface | null>(null);

const MudProvider = ({
  world,
  systems,
  components,
  children,
}: {
  world: World;
  systems: TxQueue<SystemTypes>;
  components: typeof defaultComponents;
  children: ReactNode;
}) => {
  return (
    <MudContext.Provider
      value={{
        world,
        systems,
        components,
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
    throw new Error("could not find context value");
  } else {
    return mudData;
  }
}
