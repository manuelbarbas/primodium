import { Hex } from "viem";
import type { Sync } from "@primodiumxyz/sync-stack";
import { Entity } from "@latticexyz/recs";
export const getAllianceQuery = ({
  tables,
  world,
  indexerUrl,
  alliance,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
  worldAddress: Hex;
  alliance: Entity;
}) => {
  return {
    indexerUrl,
    tables,
    world,
    query: {
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
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
