import { Entity } from "@latticexyz/recs";
import { Sync } from "@primodiumxyz/sync-stack";
import { SyncSourceType, SyncStep } from "@/lib/types";
import { Keys } from "@/lib/constants";
import { hashEntities } from "@/utils/global/encode";
import { Hex } from "viem";
import { getAllianceQuery } from "./queries/allianceQueries";
import { getActiveAsteroidQuery, getAsteroidQuery, getShardAsteroidQuery } from "./queries/asteroidQueries";
import { getBattleReportQuery } from "./queries/battleReportQueries";
import { getFleetQuery } from "./queries/fleetQueries";
import { getInitialQuery } from "./queries/initialQueries";
import { getPlayerQuery } from "./queries/playerQueries";
import { hydrateFromRPC } from "./rpc";
import { getSecondaryQuery } from "@/sync/queries/secondaryQueries";
import { SetupResult } from "@/lib/types";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createSyncHandlers } from "@/sync/createSyncHandlers";

export const hydrateInitialGameState = (
  setupResult: SetupResult,
  playerAddress: Hex,
  onComplete: () => void,
  onError: (err: unknown) => void
) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!networkConfig.indexerUrl) return;

  const sync = Sync.withQueryDecodedIndexerRecsSync(
    getInitialQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl,
      playerAddress,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

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

export const hydrateSecondaryGameState = (
  setupResult: SetupResult,
  onComplete: () => void,
  onError: (err: unknown) => void
) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;
  let fromBlock = networkConfig.initialBlockNumber;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!networkConfig.indexerUrl) return;

  const syncId = Keys.SECONDARY;
  const sync = Sync.withQueryDecodedIndexerRecsSync(
    getSecondaryQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  sync.start(async (_, blockNumber, progress) => {
    fromBlock = blockNumber;

    components.SyncStatus.set(
      {
        step: SyncStep.Syncing,
        progress,
        message: `Hydrating from Indexer`,
      },
      syncId
    );

    // hydrate remaining blocks from RPC
    if (progress === 1) {
      const latestBlockNumber = await setupResult.network.publicClient.getBlockNumber();
      hydrateFromRPC(
        setupResult,
        fromBlock,
        latestBlockNumber,
        onComplete,
        () => {
          console.warn("Failed to hydrate remaining blocks. Client may be out of sync!");
        },
        syncId
      );
    }
  }, onError);

  world.registerDisposer(sync.unsubscribe);
};

export const hydratePlayerData = (setupResult: SetupResult, playerEntity: Entity | undefined, playerAddress: Hex) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  if (!playerEntity) return;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(playerEntity)) {
    console.log("Skipping sync for player (exists):", playerEntity);
    return;
  }

  const syncData = Sync.withFilterIndexerRecsSync(
    getPlayerQuery({
      indexerUrl: networkConfig.indexerUrl!,
      tables,
      world,
      playerAddress,
      playerEntity: playerEntity as Hex,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(setupResult, playerEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Player data",
      progress: "Hydrating Player Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAsteroidData = (setupResult: SetupResult, selectedRock: Entity | undefined, shard?: boolean) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!selectedRock) return;

  const syncId = hashEntities(Keys.SELECTED, selectedRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for selected spacerock (exists):", selectedRock);
    return;
  }

  const params = {
    tables,
    world,
    indexerUrl: networkConfig.indexerUrl!,
    asteroid: selectedRock,
    worldAddress: networkConfig.worldAddress as Hex,
  };
  const syncData = Sync.withFilterIndexerRecsSync(shard ? getShardAsteroidQuery(params) : getAsteroidQuery(params));

  syncData.start(
    ...createSyncHandlers(setupResult, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Selected Asteroid data",
      progress: "Hydrating Selected Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateActiveAsteroid = (setupResult: SetupResult, activeRock: Entity | undefined) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!activeRock) return;

  const syncId = hashEntities(Keys.ACTIVE, activeRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for active spacerock (exists):", activeRock);
    return;
  }

  const syncData = Sync.withQueryDecodedIndexerRecsSync(
    getActiveAsteroidQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl!,
      asteroid: activeRock,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(setupResult, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Active Asteroid data",
      progress: "Hydrating Active Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAllianceData = (setupResult: SetupResult, allianceEntity: Entity | undefined) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  if (!allianceEntity) return;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(allianceEntity)) {
    console.log("Skipping sync for alliance (exists):", allianceEntity);
    return;
  }

  const syncData = Sync.withQueryDecodedIndexerRecsSync(
    getAllianceQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl!,
      alliance: allianceEntity,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(setupResult, allianceEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Alliance data",
      progress: "Hydrating Alliance Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateFleetData = (setupResult: SetupResult, fleetEntity: Entity | undefined) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  if (!fleetEntity) return;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(fleetEntity)) {
    console.log("Skipping sync for fleet (exists):", fleetEntity);
    return;
  }

  const ownerAsteroid = (components.OwnedBy.get(fleetEntity)?.value ?? singletonEntity) as Entity;
  const syncData = Sync.withFilterIndexerRecsSync(
    getFleetQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl!,
      fleet: fleetEntity,
      ownerAsteroid,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(setupResult, fleetEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Fleet data",
      progress: "Hydrating Fleet Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateBattleReports = (setupResult: SetupResult, playerEntity: Entity | undefined) => {
  const {
    network: { tables, world, config: networkConfig },
    components,
  } = setupResult;

  if (!playerEntity) return;

  const syncId = hashEntities(Keys.BATTLE, playerEntity);

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for battle reports (exists):", playerEntity);
    return;
  }

  const syncData = Sync.withQueryDecodedIndexerRecsSync(
    getBattleReportQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl!,
      playerEntity,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(setupResult, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Battle Reports",
      progress: "Hydrating Battle Reports",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};
