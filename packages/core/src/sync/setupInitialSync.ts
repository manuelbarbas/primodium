import { SyncSourceType, SyncStep } from "src/util/constants";
import { getNetworkConfig } from "../network/config/networkConfig";
import { hydrateInitialGameState, hydrateSecondaryGameState } from "../sync/indexer";
import { hydrateFromRPC, subToRPC } from "../sync/rpc";
import { SetupResult } from "../types";
import { Hex } from "viem";

export const setupInitialSync = async (setupResult: SetupResult, playerAddress: Hex) => {
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

  const onError = async (err: unknown) => {
    console.warn("Failed to fetch from indexer, hydrating from RPC", err);

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
  };

  // hydrate initial game state from indexer
  hydrateInitialGameState(
    setupResult,
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
        setupResult,
        // on complete
        () => subToRPC(setupResult),
        onError
      );
    },
    onError
  );
};
