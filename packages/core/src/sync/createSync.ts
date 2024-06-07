import { Entity } from "@latticexyz/recs";
import { Sync } from "@primodiumxyz/sync-stack";
import { Components, CoreConfig, CreateNetworkResult, SyncSourceType, SyncStep } from "@/lib/types";
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

export function createSync(config: CoreConfig, network: CreateNetworkResult, components: Components) {
  const { tables, world, publicClient } = network;
  const indexerUrl = config.chain.indexerUrl;
  const fromBlock = config.initialBlockNumber ?? 0n;

  const syncFromRPC = (
    fromBlock: bigint,
    toBlock: bigint,
    onComplete?: () => void,
    onError?: (err: unknown) => void,
    syncId?: Entity
  ) => {
    const { tables, publicClient, world } = network;

    const sync = Sync.withRPCRecsSync({
      world,
      tables,
      address: config.worldAddress as Hex,
      fromBlock,
      publicClient,
      toBlock,
    });

    sync.start((_, __, progress) => {
      components.SyncStatus.set(
        {
          step: SyncStep.Syncing,
          progress,
          message: `Hydrating from RPC`,
        },
        syncId
      );

      if (progress === 1) {
        components.SyncStatus.set(
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
      tables,
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
        components.SyncStatus.set(
          {
            step: SyncStep.Syncing,
            progress,
            message: message.progress,
          },
          syncId
        );

        if (progress === 1) {
          components.SyncStatus.set(
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
        components.SyncStatus.set(
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!indexerUrl) return;

    const sync = Sync.withQueryDecodedIndexerRecsSync({
      tables,
      world,
      indexerUrl,
      query: getInitialQuery({
        tables,
        playerAddress,
        worldAddress: config.worldAddress as Hex,
      }),
    });

    sync.start(async (_, blockNumber, progress) => {
      components.SyncStatus.set({
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!indexerUrl) return;

    const syncId = Keys.SECONDARY;
    const sync = Sync.withQueryDecodedIndexerRecsSync({
      tables,
      world,
      indexerUrl,
      query: getSecondaryQuery({ tables, worldAddress: config.worldAddress as Hex }),
    });

    sync.start(async (_, blockNumber, progress) => {
      components.SyncStatus.set(
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (components.SyncStatus.get(playerEntity)) {
      console.log("Skipping sync for player (exists):", playerEntity);
      return;
    }

    const syncData = Sync.withFilterIndexerRecsSync({
      indexerUrl,
      tables,
      world,
      filter: getPlayerFilter({
        tables,
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!selectedRock || !indexerUrl) return;

    const syncId = hashEntities(Keys.SELECTED, selectedRock);

    if (components.SyncStatus.get(syncId)) {
      console.log("Skipping sync for selected spacerock (exists):", selectedRock);
      return;
    }

    const params = {
      tables,
      asteroid: selectedRock,
      worldAddress: config.worldAddress as Hex,
    };

    const syncData = Sync.withFilterIndexerRecsSync({
      tables,
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (!activeRock || !indexerUrl) return;

    const syncId = hashEntities(Keys.ACTIVE, activeRock);

    if (components.SyncStatus.get(syncId)) {
      console.log("Skipping sync for active spacerock (exists):", activeRock);
      return;
    }

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      tables,
      world,
      indexerUrl,
      query: getActiveAsteroidQuery({
        asteroid: activeRock,
        tables,
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (components.SyncStatus.get(allianceEntity)) {
      console.log("Skipping sync for alliance (exists):", allianceEntity);
      return;
    }

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      indexerUrl,
      world,
      tables,
      query: getAllianceQuery({
        tables,
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (components.SyncStatus.get(fleetEntity)) {
      console.log("Skipping sync for fleet (exists):", fleetEntity);
      return;
    }

    const ownerAsteroid = (components.OwnedBy.get(fleetEntity)?.value ?? singletonEntity) as Entity;
    const syncData = Sync.withFilterIndexerRecsSync({
      indexerUrl,
      world,
      tables,
      filter: getFleetFilter({
        tables,
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
    if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

    if (components.SyncStatus.get(syncId)) {
      console.log("Skipping sync for battle reports (exists):", playerEntity);
      return;
    }

    const syncData = Sync.withQueryDecodedIndexerRecsSync({
      tables,
      world,
      indexerUrl,
      query: getBattleReportQuery({
        tables,
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
