import { Sync } from "@primodiumxyz/sync-stack";
import { SetupResult } from "../types";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { Hex, padHex } from "viem";
import { hydrateFromRPC } from "./rpc";

export const hydrateInitialGameState = (setupResult: SetupResult, onComplete: () => void) => {
  const { network, components } = setupResult;
  const { tables, world } = network;
  const networkConfig = getNetworkConfig();
  let fromBlock = networkConfig.initialBlockNumber;

  //get all the tables that start with P_
  const configTableQueries = [...Object.keys(tables)]
    .filter((key) => key.startsWith("P_"))
    .map((tableName) => ({ tableName }));

  const sync = Sync.withQueryDecodedIndexerRecsSync({
    indexerUrl: networkConfig.indexerUrl!,
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
      hydrateFromRPC(setupResult, fromBlock, latestBlockNumber, onComplete);
    }
  });

  world.registerDisposer(sync.unsubscribe);
};
