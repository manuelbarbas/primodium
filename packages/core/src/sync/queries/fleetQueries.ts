import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { LogFilter } from "@primodiumxyz/sync-stack/types";
import { Table } from "@latticexyz/store/internal";

export const getFleetFilter = ({
  tables,
  fleet,
  worldAddress,
  ownerAsteroid,
}: {
  tables: Record<string, Table>;
  worldAddress: Hex;
  fleet: Entity;
  ownerAsteroid: Entity;
}): LogFilter => {
  return {
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
      {
        tableId: tables.UnitLevel.tableId,
        key0: ownerAsteroid,
      },
    ],
  };
};
