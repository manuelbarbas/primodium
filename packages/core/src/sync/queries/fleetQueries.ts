import { ContractTableDefs, Entity } from "@primodiumxyz/reactive-tables";
import { Hex } from "viem";
import { LogFilter } from "@primodiumxyz/sync-stack/types";

export const getFleetFilter = ({
  tables,
  fleet,
  worldAddress,
  ownerAsteroid,
}: {
  tables: ContractTableDefs;
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
