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
    //if no indexer url, hydrate from RPC
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

    return;
  }

  try {
    //hydrate initial game state from indexer
    hydrateInitialGameState(setupResult, () => {
      components.SyncStatus.set({
        live: true,
        progress: 1,
        message: `DONE`,
      });

      //finally sync live
      subToRPC(setupResult);
    });
  } catch (e) {
    console.warn("Indexer failed, hydrating from RPC");
    //if indexer fails, hydrate from RPC
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
};
