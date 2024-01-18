import { getNetworkConfig } from "../config/getNetworkConfig";
import { SetupResult } from "../types";
import { hydrateFromRPC, subToRPC } from "../sync/rpc";
import { hydrateInitialGameState } from "../sync/indexer";

export const setupInitialSync = async (setupResult: SetupResult) => {
  const { network, components } = setupResult;
  const { publicClient } = network;
  const networkConfig = getNetworkConfig();

  const fromBlock = networkConfig.initialBlockNumber;

  if (!networkConfig.indexerUrl) {
    console.warn("No indexer url found, hydrating from RPC");
    const toBlock = await publicClient.getBlockNumber();
    hydrateFromRPC(
      setupResult,
      fromBlock,
      toBlock,
      //on complete
      () => {
        components.SyncStatus.set({
          live: true,
          progress: 1,
          message: `DONE`,
        });

        //finally sync live
        subToRPC(setupResult);
      },
      //on error
      (err) => {
        console.warn("Failed to hydrate from RPC");
        console.log(err);
      }
    );

    return;
  }

  //hydrate initial game state from indexer
  hydrateInitialGameState(
    setupResult,
    //on complete
    () => {
      components.SyncStatus.set({
        live: true,
        progress: 1,
        message: `DONE`,
      });

      //finally sync live
      subToRPC(setupResult);
    },
    //on error
    async (err) => {
      console.warn("Failed to fetch from indexer, hydrating from RPC");
      console.error(err);
      const toBlock = await publicClient.getBlockNumber();
      hydrateFromRPC(setupResult, fromBlock, toBlock, () => {
        components.SyncStatus.set({
          live: true,
          progress: 1,
          message: `DONE`,
        });

        //finally sync live
        subToRPC(setupResult);
      });
    }
  );
};
