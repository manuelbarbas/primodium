import { Entity } from "@latticexyz/recs";
import { Sync } from "@primodiumxyz/sync-stack";
import { Tables, CoreConfig, CreateNetworkResult, SyncSourceType, SyncStep } from "@/lib/types";
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
import { singletonEntity } from "@latticexyz/store-sync/recs";

export function createSync(config: CoreConfig, network: CreateNetworkResult, tables: Tables) {
  const { rawTables, world, publicClient } = network;
  const indexerUrl = config.chain.indexerUrl;
  const fromBlock = config.initialBlockNumber ?? 0n;

  const syncFromRPC = (
    fromBlock: bigint,
    toBlock: bigint,
    onComplete?: () => void,
    onError?: (err: unknown) => void,
    syncId?: Entity
  ) => {
    const sync = Sync.withRPCRecsSync({
      world,
      tables: rawTables,
      address: config.worldAddress as Hex,
      fromBlock,
      publicClient,
      toBlock,
    });

    sync.start((_, __, progress) => {
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
    const sync = Sync.withLiveRPCRecsSync({
      world,
      tables: rawTables,
      address: config.worldAddress as Hex,
      publicClient,
    });

    sync.start((_, blockNumber) => {
      console.log("syncing updates on block:", blockNumber);
    });

    world.registerDisposer(sync.unsubscribe);
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

    const sync = Sync.withQueryDecodedIndexerRecsSync({
      tables: rawTables,
      world,
      indexerUrl,
      query: getInitialQuery({
        tables: rawTables,
        playerAddress,
        worldAddress: config.worldAddress as Hex,
      }),
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
    const sync = Sync.withQueryDecodedIndexerRecsSync({
      tables: rawTables,
      world,
      indexerUrl,
      query: getSecondaryQuery({ tables: rawTables, worldAddress: config.worldAddress as Hex }),
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
        syncFromRPC(
          fromBlock,
          latestBlockNumber,
          onComplete,
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

    const syncData = Sync.withFilterIndexerRecsSync({
      indexerUrl,
      tables: rawTables,
      world,
      filter: getPlayerFilter({
        tables: rawTables,
        playerAddress,
        playerEntity: playerEntity as Hex,
        worldAddress: config.worldAddress as Hex,
      }),
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
      tables: rawTables,
      asteroid: selectedRock,
      worldAddress: config.worldAddress as Hex,
    };

    const syncData = Sync.withFilterIndexerRecsSync({
      tables: rawTables,
      world,
      indexerUrl,
      filter: shard ? getShardAsteroidFilter(params) : getAsteroidFilter(params),
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

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      tables: rawTables,
      world,
      indexerUrl,
      query: getActiveAsteroidQuery({
        asteroid: activeRock,
        tables: rawTables,
        worldAddress: config.worldAddress as Hex,
      }),
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

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      indexerUrl,
      world,
      tables: rawTables,
      query: getAllianceQuery({
        tables: rawTables,
        alliance: allianceEntity,
        worldAddress: config.worldAddress as Hex,
      }),
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

    const ownerAsteroid = (tables.OwnedBy.get(fleetEntity)?.value ?? singletonEntity) as Entity;
    const syncData = Sync.withFilterIndexerRecsSync({
      indexerUrl,
      world,
      tables: rawTables,
      filter: getFleetFilter({
        tables: rawTables,
        fleet: fleetEntity,
        ownerAsteroid,
        worldAddress: config.worldAddress as Hex,
      }),
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

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      tables: rawTables,
      world,
      indexerUrl,
      query: getBattleReportQuery({
        tables: rawTables,
        playerEntity,
        worldAddress: config.worldAddress as Hex,
      }),
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
