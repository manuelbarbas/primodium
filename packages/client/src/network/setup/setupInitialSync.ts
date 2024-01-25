import { getNetworkConfig } from "../config/getNetworkConfig";
import { SetupResult } from "../types";
import { hydrateFromRPC, subToRPC } from "../sync/rpc";
import { hydrateInitialGameState } from "../sync/indexer";
import { SyncSourceType, SyncStep } from "src/util/constants";

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
          step: SyncStep.Complete,
          progress: 1,
          message: `DONE`,
        });

        components.SyncSource.set({ value: SyncSourceType.RPC });

        //finally sync live
        subToRPC(setupResult);
      },
      //on error
      (err: unknown) => {
        components.SyncStatus.set({
          step: SyncStep.Error,
          progress: 0,
          message: `Failed to hydrate from RPC`,
        });

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
      components.SyncSource.set({ value: SyncSourceType.Indexer });

      //finally sync live
      subToRPC(setupResult);
    },
    //on error
    async (err) => {
      console.warn("Failed to fetch from indexer, hydrating from RPC");
      console.error(err);

      const toBlock = await publicClient.getBlockNumber();
      hydrateFromRPC(
        setupResult,
        fromBlock,
        toBlock,
        //on complete
        () => {
          components.SyncSource.set({ value: SyncSourceType.RPC });

          //finally sync live
          subToRPC(setupResult);
        },
        //on error
        (err: unknown) => {
          components.SyncStatus.set({
            step: SyncStep.Error,
            progress: 0,
            message: `Failed to hydrate from RPC. Please try again.`,
          });
          console.warn("Failed to hydrate from RPC");
          console.log(err);
        }
      );
    }
  );
};
