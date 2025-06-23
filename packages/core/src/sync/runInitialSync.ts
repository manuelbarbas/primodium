import { Core, SyncSourceType, SyncStep } from "@/lib/types";

export const runInitialSync = async (core: Core) => {
  const {
    network,
    tables,
    config,
    sync: { syncFromRPC, subscribeToRPC, syncInitialGameState, syncSecondaryGameState },
  } = core;
  const { publicClient, triggerUpdateStream } = network;
  const fromBlock = config.initialBlockNumber ?? 0n;

  // Updated onSyncComplete function
  const onSyncComplete = () => {
    // Set sync status to Live
    tables.SyncStatus.set({
      step: SyncStep.Live,
      progress: 1,
      message: "Subscribed to live updates",
    });

    // Add small delay before triggering UI update
    setTimeout(() => {
      triggerUpdateStream();

      // Schedule a secondary update as a safeguard
      setTimeout(triggerUpdateStream, 500);
    }, 100);
  };

  if (!config.chain.indexerUrl) {
    console.warn("No indexer url found, hydrating from RPC");
    tables.SyncSource.set({ value: SyncSourceType.RPC });

    const toBlock = await publicClient.getBlockNumber();
    const { processPendingLogs, disableStoring } = subscribeToRPC();

    syncFromRPC(
      fromBlock,
      toBlock,
      // onComplete
      () => {
        disableStoring();
        processPendingLogs();
        onSyncComplete();
      },
      // onError
      (err: unknown) => {
        tables.SyncStatus.set({
          step: SyncStep.Error,
          progress: 0,
          message: `Failed to sync from RPC`,
        });
        console.warn("Failed to sync from RPC", err);
      },
    );
    return;
  }

  const onError = async (err: unknown) => {
    console.warn("Failed to fetch from indexer, hydrating from RPC", err);
    tables.SyncSource.set({ value: SyncSourceType.RPC });
    const toBlock = await publicClient.getBlockNumber();
    const { processPendingLogs, disableStoring } = subscribeToRPC();

    syncFromRPC(
      fromBlock,
      toBlock,
      // onComplete
      () => {
        disableStoring();
        processPendingLogs();
        onSyncComplete();
      },
      // onError
      (err: unknown) => {
        tables.SyncStatus.set({
          step: SyncStep.Error,
          progress: 0,
          message: `Failed to sync from RPC. Please try again.`,
        });
        console.warn("Failed to sync from RPC", err);
      },
    );
  };

  tables.SyncSource.set({ value: SyncSourceType.Indexer });

  syncInitialGameState(
    // onComplete
    () => {
      tables.SyncStatus.set({
        step: SyncStep.Complete,
        progress: 1,
        message: `DONE`,
      });

      syncSecondaryGameState(onSyncComplete, onError);
    },
    onError,
  );

  return await new Promise<void>((resolve) => {
    tables.SyncStatus.watch({
      onChange: ({ properties }) => {
        if (properties.current?.step === SyncStep.Live) {
          // Add small delay before resolving
          setTimeout(resolve, 100);
        }
      },
    });

    // Fallback timeout
    setTimeout(resolve, 3000);
  });
};
