import { useEffect, useMemo } from "react";
import { ampli } from "src/ampli";
import { Account } from "src/network/components/clientComponents";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { setupDoubleCounter } from "src/network/systems/setupDoubleCounter";
import { useMud } from "./useMud";

export const useInit = () => {
  console.log("in useInit");
  const mud = useMud();

  Account.set({ value: mud.network.playerEntity });

  const initialized = useMemo(() => {
    return true;
  }, []);

  //initialize systems
  useEffect(() => {
    setupBlockNumber(mud.network.latestBlockNumber$);
    setupDoubleCounter(mud);
  }, []);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(mud.network.address, {
      extra: {
        external,
      },
    });
  }, [mud.network.address]);

  return initialized;
};
