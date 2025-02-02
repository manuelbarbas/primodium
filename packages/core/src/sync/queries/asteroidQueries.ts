import { Hex } from "viem";

import { ContractTableDefs, Entity } from "@primodiumxyz/reactive-tables";
import { DecodedIndexerQuery, LogFilter } from "@primodiumxyz/sync-stack/types";

export const getAsteroidFilter = ({
  tables,
  asteroid,
  worldAddress,
}: {
  tables: ContractTableDefs;
  worldAddress: Hex;
  asteroid: Entity;
}): LogFilter => {
  return {
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
        tableId: tables.LastConquered.tableId,
        key0: asteroid,
      },
      {
        tableId: tables.Keys_UnitFactorySet.tableId,
        key0: asteroid,
      },
      {
        tableId: tables.DroidRegenTimestamp.tableId,
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
  };
};

export const getShardAsteroidFilter = ({
  tables,
  asteroid,
  worldAddress,
}: {
  tables: ContractTableDefs;
  worldAddress: Hex;
  asteroid: Entity;
}): LogFilter => {
  return {
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
    ],
  };
};

export const getActiveAsteroidQuery = ({
  tables,
  asteroid,
  worldAddress,
}: {
  tables: ContractTableDefs;
  worldAddress: Hex;
  asteroid: Entity;
}): DecodedIndexerQuery => {
  return {
    address: worldAddress as Hex,
    queries: [
      //get buildings
      {
        tableId: tables.Position.tableId,
        where: {
          column: "parent_entity",
          operation: "eq",
          value: asteroid as Hex,
        },
        include: [
          {
            tableId: tables.OwnedBy.tableId,
          },
          {
            tableId: tables.TilePositions.tableId,
          },
          {
            tableId: tables.BuildingType.tableId,
          },
          {
            tableId: tables.IsActive.tableId,
          },
          {
            tableId: tables.Level.tableId,
          },
          {
            tableId: tables.LastClaimedAt.tableId,
          },
          {
            tableId: tables.CooldownEnd.tableId,
          },
          {
            tableId: tables.ClaimOffset.tableId,
          },
          {
            tableId: tables.Meta_UnitProductionQueue.tableId,
          },
          {
            tableId: tables.Value_UnitProductionQueue.tableId,
            on: "entity",
          },
        ],
      },
      //get expansion level
      {
        tableId: tables.Level.tableId,
        where: {
          column: "entity",
          operation: "eq",
          value: asteroid as Hex,
        },
      },
    ],
  };
};
