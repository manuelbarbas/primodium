import { SyncSourceType, SyncStep } from "@/lib/types";
import { Core } from "../lib/types";
import { Hex } from "viem";

/**
 * Runs default initial sync process. Syncs to indexer. If indexer is not available, syncs to RPC.
 *
 * @param core {@link Core}
 * @param playerAddress player address (optional). If included, will fetch player data on initial sync
 */
export const runInitialSync = async (core: Core, playerAddress?: Hex) => {
  const {
    network,
    tables,
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
        tables.SyncSource.set({ value: SyncSourceType.RPC });

        //finally sync live
        subscribeToRPC();
      },
      //on error
      (err: unknown) => {
        tables.SyncStatus.set({
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
        tables.SyncSource.set({ value: SyncSourceType.RPC });
        subscribeToRPC();
      },
      //on error
      (err: unknown) => {
        tables.SyncStatus.set({
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
      tables.SyncSource.set({ value: SyncSourceType.Indexer });
      tables.SyncStatus.set({
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
