import { useEffect, useMemo } from "react";
import { useAccount } from "./useAccount";
import { useMud } from "./useMud";
import { setupActiveAsteroid } from "src/network/systems/setupActiveAsteroid";
import {
  ActiveAsteroid,
  Account,
} from "src/network/components/clientComponents";
import { setupTrainingQueues } from "src/network/systems/setupTrainingQueues";
import { setupHangar } from "src/network/systems/setupHangar";
import { setupLeaderboard } from "src/network/systems/setupLeaderboard";
import { setupBattleComponent } from "src/network/systems/setupBattleComponent";
import { setupNotificationQueue } from "src/network/systems/setupNotificationQueue";
import { setupBlockNumber } from "src/network/systems/setupBlockNumber";
import { ampli } from "src/ampli";

export const useInit = () => {
  const { blockNumber$ } = useMud();
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
  const connectedAccountInfo = useAccount();
  useEffect(() => {
    ampli.identify(connectedAccountInfo.rawAddress, {
      extra: {
        external: connectedAccountInfo.external,
      },
    });
  }, [connectedAccountInfo]);

  return initialized;
};
