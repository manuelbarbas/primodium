import { EntityType } from "@/util/constants";
import type { Sync } from "@primodiumxyz/sync-stack";
import { Hex, pad } from "viem";

export const getInitialQuery = ({
  tables,
  world,
  indexerUrl,
  playerAddress,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
  playerAddress: Hex;
  worldAddress: Hex;
}) => {
  //get all the tables that start with P_
  const configTableQueries = [...Object.keys(tables)]
    .filter((key) => key.startsWith("P_"))
    .map((tableName) => ({ tableId: tables[tableName].tableId }));

  return {
    indexerUrl,
    tables,
    world,
    query: {
      address: worldAddress as Hex,
      queries: [
        ...configTableQueries,
        { tableId: tables.FunctionSelectors.tableId },
        { tableId: tables.FunctionSignatures.tableId },
        { tableId: tables.Dimensions.tableId },
        { tableId: tables.GracePeriod.tableId },
        { tableId: tables.Reserves.tableId },
        // main base starting coord
        { tableId: tables.Position.tableId, where: { column: "entity", operation: "eq", value: EntityType.MainBase } },
        // player asteroids
        {
          tableId: tables.OwnedBy.tableId,
          where: {
            column: "value",
            operation: "eq",
            value: pad(playerAddress, { size: 32 }),
          },
          include: [{ tableId: tables.Asteroid.tableId }],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
