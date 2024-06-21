import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import { Read, Sync } from "@primodiumxyz/sync-stack";
import { Tables, CoreConfig, CreateNetworkResult, SyncSourceType, SyncStep, Sync as SyncType } from "@/lib/types";
import { Keys } from "@/lib/constants";
import { hashEntities } from "@/utils/global/encode";
import { Hex } from "viem";
import { getAllianceQuery } from "./queries/allianceQueries";
import { getActiveAsteroidQuery, getAsteroidFilter, getShardAsteroidFilter } from "./queries/asteroidQueries";
import { getBattleReportQuery } from "./queries/battleReportQueries";
import { getFleetFilter } from "./queries/fleetQueries";
import { getInitialQuery } from "./queries/initialQueries";
import { getPlayerFilter } from "./queries/playerQueries";
import { getSecondaryQuery } from "@/sync/queries/secondaryQueries";
import { StorageAdapterLog } from "@primodiumxyz/reactive-tables/utils";

/**
 * Creates sync object. Includes methods to sync data from RPC and Indexer
 *
 * @param config core configuration {@link CoreConfig}
 * @param network network object created in {@link createNetwork} {@link CreateNetworkResult}
 * @param tables tables generated for core object
 * @returns {@link SyncType Sync}
 */
export function createSync(config: CoreConfig, network: CreateNetworkResult, tables: Tables) {
  const { tableDefs, world, publicClient, storageAdapter } = network;
  const indexerUrl = config.chain.indexerUrl;
  const fromBlock = config.initialBlockNumber ?? 0n;

  const syncFromRPC = (
    fromBlock: bigint,
    toBlock: bigint,
    onComplete?: () => void,
    onError?: (err: unknown) => void,
    syncId?: Entity
  ) => {
    const sync = Sync.withCustom({
      reader: Read.fromRPC.filter({
        address: config.worldAddress as Hex,
        publicClient,
        fromBlock,
        toBlock,
      }),
      writer: storageAdapter,
    });

    sync.start((_, __, progress) => {
      console.log("syncing from rpc", (progress * 100).toFixed(2) + "%");
      tables.SyncStatus.set(
        {
          step: SyncStep.Syncing,
          progress,
          message: `Hydrating from RPC`,
        },
        syncId
      );

      if (progress === 1) {
        tables.SyncStatus.set(
          {
            step: SyncStep.Complete,
            progress: 1,
            message: `DONE`,
          },
          syncId
        );

        onComplete?.();
      }
    }, onError);

    world.registerDisposer(sync.unsubscribe);
  };

  const subscribeToRPC = () => {
    // Store logs that come in during indexer & rpc sync
    const pendingLogs: StorageAdapterLog[] = [];
    const storePendingLogs = (log: StorageAdapterLog) => pendingLogs.push(log);
    // Process logs right after sync and before switching to live
    const processPendingLogs = () =>
      pendingLogs.forEach((log, index) => {
        storageAdapter(log);
        tables.SyncStatus.update({
          message: "Processing pending logs",
          progress: index / pendingLogs.length,
        });
      });

    const sync = Sync.withCustom({
      reader: Read.fromRPC.subscribe({
        address: config.worldAddress as Hex,
        publicClient,
      }),
      writer: (logs) =>
        tables.SyncStatus.get()?.step === SyncStep.Live ? storageAdapter(logs) : storePendingLogs(logs),
    });

    sync.start((_, blockNumber) => {
      console.log("syncing updates on block:", blockNumber);
    });

    world.registerDisposer(sync.unsubscribe);
    return processPendingLogs;
  };

  function createSyncHandlers(
    syncId: Entity,
    message: {
      progress: string;
      complete: string;
      error: string;
    }
  ) {
    return [
      (_: number, ___: bigint, progress: number) => {
        tables.SyncStatus.set(
          {
            step: SyncStep.Syncing,
            progress,
            message: message.progress,
          },
          syncId
        );

        if (progress === 1) {
          tables.SyncStatus.set(
            {
              step: SyncStep.Complete,
              progress,
              message: message.complete,
            },
            syncId
          );
        }
      },
      // on error
      (e: unknown) => {
        console.error(e);
        tables.SyncStatus.set(
          {
            step: SyncStep.Error,
            progress: 0,
            message: message.error,
          },
          syncId
        );
      },
    ];
  }

  const syncInitialGameState = (
    playerAddress: Hex | undefined,
    onComplete: () => void,
    onError: (err: unknown) => void
  ) => {
    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!indexerUrl) return;

    const sync = Sync.withCustom({
      reader: Read.fromDecodedIndexer.query({
        indexerUrl,
        query: getInitialQuery({
          tables: tableDefs,
          playerAddress,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    sync.start(async (_, blockNumber, progress) => {
      tables.SyncStatus.set({
        step: SyncStep.Syncing,
        progress,
        message: `Hydrating from Indexer`,
      });

      if (progress === 1) onComplete();
    }, onError);

    world.registerDisposer(sync.unsubscribe);
  };

  const syncSecondaryGameState = (onComplete: () => void, onError: (err: unknown) => void) => {
    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!indexerUrl) return;

    const syncId = Keys.SECONDARY;
    const sync = Sync.withCustom({
      reader: Read.fromDecodedIndexer.query({
        indexerUrl,
        query: getSecondaryQuery({ tables: tableDefs, worldAddress: config.worldAddress as Hex }),
      }),
      writer: storageAdapter,
    });

    sync.start(async (_, blockNumber, progress) => {
      tables.SyncStatus.set(
        {
          step: SyncStep.Syncing,
          progress,
          message: `Hydrating from Indexer`,
        },
        syncId
      );

      // sync remaining blocks from RPC
      if (progress === 1) {
        const latestBlockNumber = await publicClient.getBlockNumber();
        const processPendingLogs = subscribeToRPC();

        syncFromRPC(
          fromBlock,
          latestBlockNumber,
          () => {
            processPendingLogs();
            onComplete();
          },
          () => {
            console.warn("Failed to sync remaining blocks. Client may be out of sync!");
          },
          syncId
        );
      }
    }, onError);

    world.registerDisposer(sync.unsubscribe);
  };

  const syncPlayerData = (playerEntity: Entity | undefined, playerAddress: Hex) => {
    if (!playerEntity || !indexerUrl) return;

    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (tables.SyncStatus.get(playerEntity)) {
      console.log("Skipping sync for player (exists):", playerEntity);
      return;
    }

    const syncData = Sync.withCustom({
      reader: Read.fromIndexer.filter({
        indexerUrl,
        filter: getPlayerFilter({
          tables: tableDefs,
          playerAddress,
          playerEntity: playerEntity as Hex,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(playerEntity, {
        complete: "DONE",
        error: "Failed to sync Player data",
        progress: "Hydrating Player Data",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  const syncAsteroidData = (selectedRock: Entity | undefined, shard?: boolean) => {
    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!selectedRock || !indexerUrl) return;

    const syncId = hashEntities(Keys.SELECTED, selectedRock);

    if (tables.SyncStatus.get(syncId)) {
      console.log("Skipping sync for selected spacerock (exists):", selectedRock);
      return;
    }

    const params = {
      tables: tableDefs,
      asteroid: selectedRock,
      worldAddress: config.worldAddress as Hex,
    };

    const syncData = Sync.withCustom({
      reader: Read.fromIndexer.filter({
        indexerUrl,
        filter: shard ? getShardAsteroidFilter(params) : getAsteroidFilter(params),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(syncId, {
        complete: "DONE",
        error: "Failed to sync Selected Asteroid data",
        progress: "Hydrating Selected Asteroid Data",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  const syncActiveAsteroid = (activeRock: Entity | undefined) => {
    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!activeRock || !indexerUrl) return;

    const syncId = hashEntities(Keys.ACTIVE, activeRock);

    if (tables.SyncStatus.get(syncId)) {
      console.log("Skipping sync for active spacerock (exists):", activeRock);
      return;
    }

    const syncData = Sync.withCustom({
      reader: Read.fromDecodedIndexer.query({
        indexerUrl,
        query: getActiveAsteroidQuery({
          tables: tableDefs,
          asteroid: activeRock,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(syncId, {
        complete: "DONE",
        error: "Failed to sync Active Asteroid data",
        progress: "Hydrating Active Asteroid Data",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  const syncAllianceData = (allianceEntity: Entity | undefined) => {
    if (!allianceEntity || !indexerUrl) return;

    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (tables.SyncStatus.get(allianceEntity)) {
      console.log("Skipping sync for alliance (exists):", allianceEntity);
      return;
    }

    const syncData = Sync.withCustom({
      reader: Read.fromDecodedIndexer.query({
        indexerUrl,
        query: getAllianceQuery({
          tables: tableDefs,
          alliance: allianceEntity,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(allianceEntity, {
        complete: "DONE",
        error: "Failed to sync Alliance data",
        progress: "Hydrating Alliance Data",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  const syncFleetData = (fleetEntity: Entity | undefined) => {
    if (!fleetEntity || !indexerUrl) return;

    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (tables.SyncStatus.get(fleetEntity)) {
      console.log("Skipping sync for fleet (exists):", fleetEntity);
      return;
    }

    const ownerAsteroid = (tables.OwnedBy.get(fleetEntity)?.value ?? defaultEntity) as Entity;
    const syncData = Sync.withCustom({
      reader: Read.fromIndexer.filter({
        indexerUrl,
        filter: getFleetFilter({
          tables: tableDefs,
          fleet: fleetEntity,
          ownerAsteroid,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(fleetEntity, {
        complete: "DONE",
        error: "Failed to sync Fleet data",
        progress: "Hydrating Fleet Data",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  const syncBattleReports = (playerEntity: Entity | undefined) => {
    if (!playerEntity || !indexerUrl) return;

    const syncId = hashEntities(Keys.BATTLE, playerEntity);

    // if we're already syncing from RPC, don't sync from indexer
    if (tables.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (tables.SyncStatus.get(syncId)) {
      console.log("Skipping sync for battle reports (exists):", playerEntity);
      return;
    }

    const syncData = Sync.withCustom({
      reader: Read.fromDecodedIndexer.query({
        indexerUrl,
        query: getBattleReportQuery({
          tables: tableDefs,
          playerEntity,
          worldAddress: config.worldAddress as Hex,
        }),
      }),
      writer: storageAdapter,
    });

    syncData.start(
      ...createSyncHandlers(syncId, {
        complete: "DONE",
        error: "Failed to sync Battle Reports",
        progress: "Hydrating Battle Reports",
      })
    );

    world.registerDisposer(() => {
      syncData.unsubscribe();
    });
  };

  return {
    syncFromRPC,
    subscribeToRPC,

    syncInitialGameState,
    syncSecondaryGameState,
    syncPlayerData,
    syncAsteroidData,
    syncActiveAsteroid,
    syncAllianceData,
    syncFleetData,
    syncBattleReports,
  };
}
