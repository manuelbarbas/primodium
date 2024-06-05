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
import { Core } from "@/lib/types";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createSyncHandlers } from "@/sync/createSyncHandlers";

export const hydrateInitialGameState = (
  core: Core,
  playerAddress: Hex | undefined,
  onComplete: () => void,
  onError: (err: unknown) => void
) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!indexerUrl) return;

  const sync = Sync.withQueryDecodedIndexerRecsSync(
    getInitialQuery({
      tables,
      world,
      indexerUrl,
      playerAddress,
      worldAddress: config.worldAddress as Hex,
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

export const hydrateSecondaryGameState = (core: Core, onComplete: () => void, onError: (err: unknown) => void) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;
  let fromBlock = config.initialBlockNumber ?? 0n;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!indexerUrl) return;

  const syncId = Keys.SECONDARY;
  const sync = Sync.withQueryDecodedIndexerRecsSync(
    getSecondaryQuery({
      tables,
      world,
      indexerUrl,
      worldAddress: config.worldAddress as Hex,
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
      const latestBlockNumber = await core.network.publicClient.getBlockNumber();
      hydrateFromRPC(
        core,
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

export const hydratePlayerData = (core: Core, playerEntity: Entity | undefined, playerAddress: Hex) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;

  if (!playerEntity || !indexerUrl) return;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (components.SyncStatus.get(playerEntity)) {
    console.log("Skipping sync for player (exists):", playerEntity);
    return;
  }

  const syncData = Sync.withFilterIndexerRecsSync(
    getPlayerQuery({
      indexerUrl,
      tables,
      world,
      playerAddress,
      playerEntity: playerEntity as Hex,
      worldAddress: config.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(core, playerEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Player data",
      progress: "Hydrating Player Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAsteroidData = (core: Core, selectedRock: Entity | undefined, shard?: boolean) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;

  const indexerUrl = config.chain.indexerUrl;
  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!selectedRock || !indexerUrl) return;

  const syncId = hashEntities(Keys.SELECTED, selectedRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for selected spacerock (exists):", selectedRock);
    return;
  }

  const params = {
    tables,
    world,
    indexerUrl: indexerUrl,
    asteroid: selectedRock,
    worldAddress: config.worldAddress as Hex,
  };
  const syncData = Sync.withFilterIndexerRecsSync(shard ? getShardAsteroidQuery(params) : getAsteroidQuery(params));

  syncData.start(
    ...createSyncHandlers(core, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Selected Asteroid data",
      progress: "Hydrating Selected Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateActiveAsteroid = (core: Core, activeRock: Entity | undefined) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;

  // if we're already syncing from RPC, don't hydrate from indexer
  if (components.SyncSource.get()?.value === SyncSourceType.RPC) return;

  if (!activeRock || !indexerUrl) return;

  const syncId = hashEntities(Keys.ACTIVE, activeRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for active spacerock (exists):", activeRock);
    return;
  }

  const syncData = Sync.withQueryDecodedIndexerRecsSync(
    getActiveAsteroidQuery({
      tables,
      world,
      indexerUrl,
      asteroid: activeRock,
      worldAddress: config.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(core, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Active Asteroid data",
      progress: "Hydrating Active Asteroid Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateAllianceData = (core: Core, allianceEntity: Entity | undefined) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;

  if (!allianceEntity || !indexerUrl) return;

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
      indexerUrl,
      alliance: allianceEntity,
      worldAddress: config.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(core, allianceEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Alliance data",
      progress: "Hydrating Alliance Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateFleetData = (core: Core, fleetEntity: Entity | undefined) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;
  const indexerUrl = config.chain.indexerUrl;

  if (!fleetEntity || !indexerUrl) return;

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
      indexerUrl,
      fleet: fleetEntity,
      ownerAsteroid,
      worldAddress: config.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(core, fleetEntity, {
      complete: "DONE",
      error: "Failed to Hydrate Fleet data",
      progress: "Hydrating Fleet Data",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateBattleReports = (core: Core, playerEntity: Entity | undefined) => {
  const {
    config,
    network: { tables, world },
    components,
  } = core;

  const indexerUrl = config.chain.indexerUrl;
  if (!playerEntity || !indexerUrl) return;

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
      indexerUrl,
      playerEntity,
      worldAddress: config.worldAddress as Hex,
    })
  );

  syncData.start(
    ...createSyncHandlers(core, syncId, {
      complete: "DONE",
      error: "Failed to Hydrate Battle Reports",
      progress: "Hydrating Battle Reports",
    })
  );

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};
