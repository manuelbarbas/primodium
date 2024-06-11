import { ContractTableDefs } from "@primodiumxyz/reactive-tables";
import { LogFilter } from "@primodiumxyz/sync-stack/types";
import { Hex, pad } from "viem";

export const getPlayerFilter = ({
  tables,
  playerAddress,
  playerEntity,
  worldAddress,
}: {
  tables: ContractTableDefs;
  playerAddress: Hex;
  playerEntity: Hex;
  worldAddress: Hex;
}): LogFilter => {
  return {
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
        tableId: tables.MaxColonySlots.tableId,
        key0: playerEntity,
      },
      {
        tableId: tables.ColonySlotsInstallments.tableId,
        key0: playerEntity,
      },
    ],
  };
};
