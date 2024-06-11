import { SyncSourceType, SyncStep } from "@/lib/types";
import { Core } from "../lib/types";
import { Hex } from "viem";

export const runInitialSync = async (core: Core, playerAddress?: Hex) => {
  const {
    network,
    components,
    config,
    sync: { syncFromRPC, subscribeToRPC, syncInitialGameState, syncSecondaryGameState },
  } = core;
  const { publicClient } = network;

  const fromBlock = config.initialBlockNumber ?? 0n;

  if (!config.chain.indexerUrl) {
    console.warn("No indexer url found, hydrating from RPC");
    const toBlock = await publicClient.getBlockNumber();
    syncFromRPC(
      fromBlock,
      toBlock,
      //on complete
      () => {
        components.SyncSource.set({ value: SyncSourceType.RPC });

        //finally sync live
        network.triggerUpdateStream();
        subscribeToRPC();
      },
      //on error
      (err: unknown) => {
        components.SyncStatus.set({
          step: SyncStep.Error,
          progress: 0,
          message: `Failed to sync from RPC`,
        });

        console.warn("Failed to sync from RPC");
        console.log(err);
      }
    );

    return;
  }

  const onError = async (err: unknown) => {
    console.warn("Failed to fetch from indexer, hydrating from RPC");

    const toBlock = await publicClient.getBlockNumber();
    syncFromRPC(
      fromBlock,
      toBlock,
      //on complete
      () => {
        components.SyncSource.set({ value: SyncSourceType.RPC });
        network.triggerUpdateStream();
        subscribeToRPC();
      },
      //on error
      (err: unknown) => {
        components.SyncStatus.set({
          step: SyncStep.Error,
          progress: 0,
          message: `Failed to sync from RPC. Please try again.`,
        });
        console.warn("Failed to sync from RPC ");
      }
    );
  };

  // sync initial game state from indexer
  syncInitialGameState(
    playerAddress,
    // on complete
    () => {
      components.SyncSource.set({ value: SyncSourceType.Indexer });
      components.SyncStatus.set({
        step: SyncStep.Complete,
        progress: 1,
        message: `DONE`,
      });

      // initialize secondary state
      syncSecondaryGameState(
        // on complete
        () => subscribeToRPC(),
        onError
      );
    },
    onError
  );
};
