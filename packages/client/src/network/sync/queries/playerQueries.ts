import { Hex, pad } from "viem";
import type { Sync } from "@primodiumxyz/sync-stack";

export const getPlayerQuery = ({
  tables,
  world,
  indexerUrl,
  playerAddress,
  playerEntity,
  worldAddress,
}: Omit<Parameters<typeof Sync.withFilterIndexerRecsSync>[0], "filter"> & {
  playerAddress: Hex;
  playerEntity: Hex;
  worldAddress: Hex;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    filter: {
      address: worldAddress,
      filters: [
        {
          tableId: tables.UserDelegationControl.tableId,
          key0: pad(playerAddress, { size: 32 }),
        },
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
          tableId: tables.ProducedUnit.tableId,
          key0: playerEntity,
        },
        {
          tableId: tables.DestroyedUnit.tableId,
          key0: playerEntity,
        },
      ],
    },
  };
};
