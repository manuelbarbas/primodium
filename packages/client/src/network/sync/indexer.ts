import { Sync } from "@primodiumxyz/sync-stack";
import { SetupResult } from "../types";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { Hex, padHex } from "viem";
import { hydrateFromRPC } from "./rpc";
import { Entity } from "@latticexyz/recs";

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
      "player-data" as Entity
    );

    if (progress === 1) {
      components.SyncStatus.set(
        {
          live: true,
          progress,
          message: `DONE`,
        },
        "player-data" as Entity
      );
    }
  });

  world.registerDisposer(() => {
    syncData.unsubscribe();
  });
};
