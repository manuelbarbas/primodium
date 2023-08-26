import { useEffect, useMemo } from "react";
import { useAccount } from "./useAccount";
import { useMud } from "./useMud";
import { setupActiveAsteroid } from "src/network/systems/setupActiveAsteroid";
import {
  ActiveAsteroid,
  BlockNumber,
  Account,
} from "src/network/components/clientComponents";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";

export const useInit = () => {
  const { world, blockNumber$ } = useMud();
  const { address } = useAccount();
  const activeAsteroid = ActiveAsteroid.use()?.value;

  const initialized = useMemo(() => {
    if (!address) return false;

    return !!activeAsteroid;
  }, [address, activeAsteroid]);

  useEffect(() => {
    if (address) {
      setupActiveAsteroid(address);
    }

    const blockListener = blockNumber$.subscribe((blockNumber) => {
      BlockNumber.set({ value: blockNumber });
    });

    Account.set({ value: address });

    return () => {
      world.registerDisposer(() => blockListener.unsubscribe());
    };
  }, [address]);

  //initialize systems
  useEffect(() => {
    setupTrainingQueues();
    setupHangar();
    setupLeaderboard();
  }, []);

  return initialized;
};
