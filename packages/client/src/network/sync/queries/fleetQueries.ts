import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import type { Sync } from "@primodiumxyz/sync-stack";

export const getFleetQuery = ({
  tables,
  world,
  indexerUrl,
  fleet,
  worldAddress,
}: Omit<Parameters<typeof Sync.withFilterIndexerRecsSync>[0], "filter"> & {
  worldAddress: Hex;
  fleet: Entity;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    filter: {
      address: worldAddress as Hex,
      filters: [
        {
          tableId: tables.ResourceCount.tableId,
          key0: fleet,
        },
        {
          tableId: tables.MaxResourceCount.tableId,
          key0: fleet,
        },
        {
          tableId: tables.LastClaimedAt.tableId,
          key0: fleet,
        },
        {
          tableId: tables.ProductionRate.tableId,
          key0: fleet,
        },
        {
          tableId: tables.UnitCount.tableId,
          key0: fleet,
        },
      ],
    },
  };
};
