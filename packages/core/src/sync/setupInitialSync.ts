import { SyncSourceType, SyncStep } from "@/lib/types";
import { hydrateInitialGameState, hydrateSecondaryGameState } from "../sync/indexer";
import { hydrateFromRPC, subToRPC } from "../sync/rpc";
import { Core } from "../lib/types";
import { Hex } from "viem";

export const setupInitialSync = async (core: Core, playerAddress?: Hex) => {
  const { network, components, config } = core;
  const { publicClient } = network;

  const fromBlock = config.initialBlockNumber;

  if (!config.chain.indexerUrl) {
    console.warn("No indexer url found, hydrating from RPC");
    const toBlock = await publicClient.getBlockNumber();
    hydrateFromRPC(
      core,
      fromBlock,
      toBlock,
      //on complete
      () => {
        components.SyncSource.set({ value: SyncSourceType.RPC });

        //finally sync live
        subToRPC(core);
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

  const onError = async (err: unknown) => {
    console.warn("Failed to fetch from indexer, hydrating from RPC", err);

    const toBlock = await publicClient.getBlockNumber();
    hydrateFromRPC(
      core,
      fromBlock,
      toBlock,
      //on complete
      () => {
        components.SyncSource.set({ value: SyncSourceType.RPC });

        //finally sync live
        subToRPC(core);
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
  };

  // hydrate initial game state from indexer
  hydrateInitialGameState(
    core,
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
      hydrateSecondaryGameState(
        core,
        // on complete
        () => subToRPC(core),
        onError
      );
    },
    onError
  );
};
