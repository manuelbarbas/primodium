import { getNetworkConfig } from "../config/getNetworkConfig";
import { Sync } from "@primodiumxyz/sync-stack";
import { Hex, padHex } from "viem";
import { SetupResult } from "../types";

export const setupInitialSync = async (setupResult: SetupResult) => {
  const { network, components } = setupResult;
  const { tables, publicClient, world } = network;
  const networkConfig = getNetworkConfig();

  const latestBlockNumber = await network.publicClient.getBlockNumber();
  let fromBlock = networkConfig.initialBlockNumber;
  //get all the tables that start with P_
  const configTableQueries = [...Object.keys(tables)]
    .filter((key) => key.startsWith("P_"))
    .map((tableName) => ({ tableName }));

  if (!networkConfig.indexerUrl) {
    Sync.withRPCRecsSync({
      world,
      tables,
      address: networkConfig.worldAddress as Hex,
      fromBlock,
      publicClient,
      toBlock: latestBlockNumber,
    }).start((_, __, progress) => {
      components.SyncStatus.set({
        live: false,
        progress,
        message: `Hydrating ${progress * 100}%`,
      });

      if (progress === 1) {
        components.SyncStatus.set({
          live: true,
          progress,
          message: `DONE`,
        });

        Sync.withLiveRPCRecsSync({
          world,
          tables,
          address: networkConfig.worldAddress as Hex,
          publicClient,
        }).start();
      }
    });

    return;
  }

  try {
    //fetch all config tables
    Sync.withQueryDecodedIndexerRecsSync({
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
      //sync remaining blocks from RPC
    }).start((_, blockNumber, progress) => {
      fromBlock = blockNumber;

      components.SyncStatus.set({
        live: false,
        progress,
        message: `Hydrating ${progress * 100}%`,
      });

      if (progress === 1) {
        Sync.withRPCRecsSync({
          world,
          tables,
          address: networkConfig.worldAddress as Hex,
          fromBlock,
          publicClient,
          toBlock: latestBlockNumber,
        }).start((_, __, progress) => {
          components.SyncStatus.set({
            live: false,
            progress,
            message: `Hydrating Remaining from RPC ${progress * 100}%`,
          });

          //finally sync live
          //TODO: if both from and to block are the same, progress returns NaN
          if (progress === 1 || isNaN(progress)) {
            components.SyncStatus.set({
              live: true,
              progress,
              message: `DONE`,
            });

            Sync.withLiveRPCRecsSync({
              world,
              tables,
              address: networkConfig.worldAddress as Hex,
              publicClient,
            }).start();
          }
        });
      }
    });
  } catch (e) {
    //TODO sync stack errors need to bubble up so client can handle them
    Sync.withRPCRecsSync({
      world,
      tables,
      address: networkConfig.worldAddress as Hex,
      fromBlock,
      publicClient,
      toBlock: latestBlockNumber,
    }).start((_, __, progress) => {
      components.SyncStatus.set({
        live: false,
        progress,
        message: `Hydrating Remaining from RPC ${progress * 100}%`,
      });

      //finally sync live
      if (progress === 1) {
        components.SyncStatus.set({
          live: true,
          progress,
          message: `DONE`,
        });

        Sync.withLiveRPCRecsSync({
          world,
          tables,
          address: networkConfig.worldAddress as Hex,
          publicClient,
        }).start();
      }
    });
  }
};
