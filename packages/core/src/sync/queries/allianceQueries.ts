import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { DecodedIndexerQuery } from "@primodiumxyz/sync-stack/types";
import { Table } from "@latticexyz/store/internal";

export const getAllianceQuery = ({
  tables,
  alliance,
  worldAddress,
}: {
  tables: Record<string, Table>;
  worldAddress: Hex;
  alliance: Entity;
}): DecodedIndexerQuery => {
  return {
    address: worldAddress as Hex,
    queries: [
      {
        tableId: tables.AllianceJoinRequest.tableId,
        where: {
          column: "alliance",
          operation: "eq",
          value: alliance as Hex,
        },
      },
      {
        tableId: tables.PlayerAlliance.tableId,
        where: {
          column: "alliance",
          operation: "eq",
          value: alliance as Hex,
        },
      },
      {
        tableId: tables.AllianceInvitation.tableId,
        where: {
          column: "alliance",
          operation: "eq",
          value: alliance as Hex,
        },
      },
    ],
  };
};
