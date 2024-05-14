import type { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";

export const getInitalQuery = ({
  tables,
  world,
  indexerUrl,
  worldAddress,
}: Omit<Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0], "query"> & {
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
        {
          tableId: tables.OwnedBy.tableId,
          where: {
            column: "value",
            operation: "eq",
            value: "0x000000000000000000000000AD285b5dF24BDE77A8391924569AF2AD2D4eE4A7",
          },
          include: [{ tableId: tables.Asteroid.tableId }],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
