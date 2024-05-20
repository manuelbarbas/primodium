import { Entity } from "@latticexyz/recs";
import { Sync } from "@primodiumxyz/sync-stack";
import { Keys, SyncSourceType, SyncStep } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { createSyncHandlers } from "src/util/sync";
import { Hex } from "viem";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { MUD, SetupResult } from "../types";
import { getAllianceQuery } from "./queries/allianceQueries";
import { getActiveAsteroidQuery, getAsteroidQuery, getShardAsteroidQuery } from "./queries/asteroidQueries";
import { getBattleReportQuery } from "./queries/battleReportQueries";
import { getFleetQuery } from "./queries/fleetQueries";
import { getInitialQuery } from "./queries/initialQueries";
import { getSecondaryQuery } from "@/network/sync/queries/secondaryQueries";
import { getPlayerQuery } from "./queries/playerQueries";
import { hydrateFromRPC } from "./rpc";

export const hydrateInitialGameState = (
  setupResult: SetupResult,
  playerAddress: Hex,
  onComplete: () => void,
  onError: (err: unknown) => void
) => {
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();
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
      const latestBlockNumber = await network.publicClient.getBlockNumber();
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

export const hydratePlayerData = (playerEntity: Entity | undefined, playerAddress: Hex, setupResult: SetupResult) => {
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
    ...createSyncHandlers(playerEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Player data",
      progress: "Hydrating Player Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAsteroidData = (selectedRock: Entity | undefined, mud: MUD, shard?: boolean) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
    ...createSyncHandlers(syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Selected Asteroid data",
      progress: "Hydrating Selected Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateActiveAsteroid = (activeRock: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
    ...createSyncHandlers(syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Active Asteroid data",
      progress: "Hydrating Active Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAllianceData = (allianceEntity: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
    ...createSyncHandlers(allianceEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Alliance data",
      progress: "Hydrating Alliance Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateFleetData = (fleetEntity: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

  if (!fleetEntity) return;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(fleetEntity)) {
    console.log("Skipping sync for fleet (exists):", fleetEntity);
    return;
  }

  const syncData = Sync.withFilterIndexerRecsSync(
    getFleetQuery({
      tables,
      world,
      indexerUrl: networkConfig.indexerUrl!,
      fleet: fleetEntity,
      worldAddress: networkConfig.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(fleetEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Fleet data",
      progress: "Hydrating Fleet Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateBattleReports = (playerEntity: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

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
    ...createSyncHandlers(syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Battle Reports",
      progress: "Hydrating Battle Reports",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};
