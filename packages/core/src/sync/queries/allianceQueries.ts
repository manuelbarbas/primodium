import { Hex } from "viem";

import { ContractTableDefs, Entity } from "@primodiumxyz/reactive-tables";
import { DecodedIndexerQuery } from "@primodiumxyz/sync-stack/types";

export const getAllianceQuery = ({
  tables,
  alliance,
  worldAddress,
}: {
  tables: ContractTableDefs;
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
