import { useEffect, useMemo } from "react";
import { useAccount } from "./useAccount";
import { useMud } from "./useMud";
import { setupHomeAsteroid } from "src/network/systems/setupActiveAsteroid";
import { HomeAsteroid, Account } from "src/network/components/clientComponents";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupBattleComponent } from "src/network/systems/setupBattleComponent";
import { setupNotificationQueue } from "src/network/systems/setupNotificationQueue";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { ampli } from "src/ampli";

export const useInit = () => {
  const { blockNumber$ } = useMud();
  const { address, rawAddress, external } = useAccount();
  const activeAsteroid = HomeAsteroid.use()?.value;

  const initialized = useMemo(() => {
    if (!address) return false;

    return !!activeAsteroid;
  }, [address, activeAsteroid]);

  useEffect(() => {
    if (address) {
      setupHomeAsteroid(address);
    }

    Account.set({ value: address });
  }, [address]);

  //initialize systems
  useEffect(() => {
    setupTrainingQueues();
    setupHangar();
    setupLeaderboard();
    setupBattleComponent();
    setupNotificationQueue();
    setupBlockNumber(blockNumber$);
  }, []);

  // The network object and user wallet will have been loaded by the time the loading state is ready
  // So we can use the user wallet to identify the user
  useEffect(() => {
    ampli.identify(rawAddress, {
      extra: {
        external,
      },
    });
  }, [rawAddress]);

  return initialized;
};
