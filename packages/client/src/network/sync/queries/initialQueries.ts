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
        // get minimal asteroid data
        {
          tableId: tables.Asteroid.tableId,
          include: [{ tableId: tables.OwnedBy.tableId }],
        },
      ],
    } as Parameters<typeof Sync.withQueryDecodedIndexerRecsSync>[0]["query"],
  };
};
