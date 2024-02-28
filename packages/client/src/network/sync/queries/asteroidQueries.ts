import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import type { Sync } from "@primodiumxyz/sync-stack";

export const getAsteroidQuery = ({
  tables,
  world,
  indexerUrl,
  asteroid,
  worldAddress,
}: Omit<Parameters<typeof Sync.withFilterIndexerRecsSync>[0], "filter"> & {
  worldAddress: Hex;
  asteroid: Entity;
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
          key0: asteroid,
        },
        {
          tableId: tables.MaxResourceCount.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.LastClaimedAt.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.ProductionRate.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.ConsumptionRate.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.UnitCount.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.Home.tableId,
          key0: asteroid,
        },
        {
          tableId: tables.UnitLevel.tableId,
          key0: asteroid,
        },
      ],
    },
  };
};

export const getActiveAsteroidQuery = ({
  tables,
  world,
  indexerUrl,
  asteroid,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
  worldAddress: Hex;
  asteroid: Entity;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    query: {
      address: worldAddress as Hex,
      queries: [
        //get buildings
        {
          tableId: tables.Position.tableId!,
          where: {
            column: "parent",
            operation: "eq",
            value: asteroid as Hex,
          },
          include: [
            {
              tableId: tables.OwnedBy.tableId!,
            },
            {
              tableId: tables.BuildingType.tableId!,
            },
            {
              tableId: tables.IsActive.tableId!,
            },
            {
              tableId: tables.Level.tableId!,
            },
            {
              tableId: tables.LastClaimedAt.tableId!,
            },
            {
              tableId: tables.ClaimOffset.tableId!,
            },
            {
              tableId: tables.QueueUnits.tableId!,
            },
            {
              tableId: tables.QueueItemUnits.tableId!,
              on: "entity",
            },
          ],
        },
        //get expansion level
        {
          tableId: tables.Level.tableId!,
          where: {
            column: "entity",
            operation: "eq",
            value: asteroid as Hex,
          },
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
