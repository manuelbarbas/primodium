import { Sync } from "@primodiumxyz/sync-stack";
import { MUD, SetupResult } from "../types";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { Hex, padHex } from "viem";
import { hydrateFromRPC } from "./rpc";
import { Entity } from "@latticexyz/recs";
import { hashEntities } from "src/util/encode";
import { Keys } from "src/util/constants";

export const hydrateInitialGameState = (
  setupResult: SetupResult,
  onComplete: () => void,
  onError: (err: unknown) => void
) => {
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();
  let fromBlock = networkConfig.initialBlockNumber;

  if (!networkConfig.indexerUrl) return;

  //get all the tables that start with P_
  const configTableQueries = [...Object.keys(tables)]
    .filter((key) => key.startsWith("P_"))
    .map((tableName) => ({ tableName }));

  const sync = Sync.withQueryDecodedIndexerRecsSync({
    indexerUrl: networkConfig.indexerUrl,
    tables: tables,
    world,
    query: {
      address: networkConfig.worldAddress as Hex,
      queries: [
        ...configTableQueries,
        { tableName: tables.Dimensions.name! },
        { tableName: tables.GracePeriod.name! },
        { tableName: tables.MapItemArrivals.name! },
        //get asteroids
        {
          tableName: tables.Position.name!,
          where: {
            column: "parent",
            operation: "eq",
            value: padHex(`0x`, { size: 32 }),
          },
          include: [
            {
              tableName: tables.OwnedBy.name!,
            },
            {
              tableName: tables.Asteroid.name!,
            },
            {
              tableName: tables.ReversePosition.name!,
            },
          ],
        },
      ],
    },
  });

  sync.start(async (_, blockNumber, progress) => {
    fromBlock = blockNumber;

    components.SyncStatus.set({
      live: false,
      progress,
      message: `Hydrating from Indexer`,
    });

    // hydrate remaining blocks from RPC
    if (progress === 1) {
      const latestBlockNumber = await network.publicClient.getBlockNumber();
      hydrateFromRPC(setupResult, fromBlock, latestBlockNumber, onComplete, () =>
        console.warn("Failed to hydrate remaining blocks. Client may be out of sync!")
      );
    }
  }, onError);

  world.registerDisposer(sync.unsubscribe);
};

export const hydratePlayerData = (playerEntity: Entity, setupResult: SetupResult) => {
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

  //TODO: sync again on error
  if (components.SyncStatus.get(playerEntity)) {
    console.log("Skipping sync for player (exists):", playerEntity);
    return;
  }

  const syncData = Sync.withFilterIndexerRecsSync({
    indexerUrl: networkConfig.indexerUrl!,
    tables: tables,
    world,
    filter: {
      address: networkConfig.worldAddress as Hex,
      filters: [
        {
          tableId: tables.Spawned.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.Home.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.PlayerAlliance.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.CompletedObjective.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.Score.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.HasBuiltBuilding.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.ProducedResource.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.RaidedResource.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.DefeatedPirate.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.ProducedUnit.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.DestroyedUnit.tableId,
          key0: playerEntity,
        },
      ],
    },
  });

  syncData.start((_, __, progress) => {
    components.SyncStatus.set(
      {
        live: false,
        progress,
        message: `Hydrating Player Data`,
      },
      playerEntity
    );

    if (progress === 1) {
      components.SyncStatus.set(
        {
          live: true,
          progress,
          message: `DONE`,
        },
        playerEntity
      );
    }
  });

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateSelectedAsteroid = (selectedRock: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

  if (!selectedRock) return;

  const syncId = hashEntities(Keys.SELECTED, selectedRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for selected spacerock (exists):", selectedRock);
    return;
  }

  const syncData = Sync.withFilterIndexerRecsSync({
    indexerUrl: networkConfig.indexerUrl!,
    tables: tables,
    world,
    filter: {
      address: networkConfig.worldAddress as Hex,
      filters: [
        {
          tableId: tables.ResourceCount.tableId,
          key0: selectedRock,
        },
        {
          tableId: tables.MaxResourceCount.tableId,
          key0: selectedRock,
        },
        {
          tableId: tables.LastClaimedAt.tableId,
          key0: selectedRock,
        },
        {
          tableId: tables.ProductionRate.tableId,
          key0: selectedRock,
        },
        {
          tableId: tables.ConsumptionRate.tableId,
          key0: selectedRock,
        },
        {
          tableId: tables.UnitCount.tableId,
          key0: selectedRock,
        },
      ],
    },
  });

  syncData.start((_, __, progress) => {
    components.SyncStatus.set(
      {
        live: false,
        progress,
        message: `Hydrating Selected Asteroid Data`,
      },
      syncId
    );

    if (progress === 1) {
      components.SyncStatus.set(
        {
          live: true,
          progress,
          message: `DONE`,
        },
        syncId
      );
    }
  });

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};

export const hydrateActiveAsteroid = (activeRock: Entity | undefined, mud: MUD) => {
  const { network, components } = mud;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();

  if (!activeRock) return;

  const syncId = hashEntities(Keys.ACTIVE, activeRock);

  if (components.SyncStatus.get(syncId)) {
    console.log("Skipping sync for active spacerock (exists):", activeRock);
    return;
  }

  const syncData = Sync.withQueryDecodedIndexerRecsSync({
    indexerUrl: networkConfig.indexerUrl!,
    tables: mud.network.tables,
    world: world,
    query: {
      address: networkConfig.worldAddress as Hex,
      queries: [
        //get buildings
        {
          tableName: mud.network.tables.Position.name!,
          where: {
            column: "parent",
            operation: "eq",
            value: activeRock as Hex,
          },
          include: [
            {
              tableName: tables.OwnedBy.name!,
            },
            {
              tableName: tables.BuildingType.name!,
            },
            {
              tableName: tables.IsActive.name!,
            },
            {
              tableName: tables.Level.name!,
            },
            {
              tableName: tables.LastClaimedAt.name!,
            },
            {
              tableName: tables.ClaimOffset.name!,
            },
            {
              tableName: tables.QueueUnits.name!,
            },
            {
              tableName: tables.QueueItemUnits.name!,
            },
          ],
        },
        //get expansion level
        {
          tableName: tables.Level.name!,
          where: {
            column: "entity",
            operation: "eq",
            value: activeRock as Hex,
          },
        },
      ],
    },
  });

  syncData.start((_, __, progress) => {
    components.SyncStatus.set(
      {
        live: false,
        progress,
        message: `Hydrating Active Asteroid Data`,
      },
      syncId
    );

    if (progress === 1) {
      components.SyncStatus.set(
        {
          live: true,
          progress,
          message: `DONE`,
        },
        syncId
      );
    }
  });

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};
