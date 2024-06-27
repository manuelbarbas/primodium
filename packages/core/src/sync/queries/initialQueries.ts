import { ContractTableDefs } from "@primodiumxyz/reactive-tables";
import { EntityType } from "@/lib/constants";
import { DecodedIndexerQuery } from "@primodiumxyz/sync-stack/types";
import { Hex } from "viem";

export const getInitialQuery = ({
  tables,
  worldAddress,
}: {
  tables: ContractTableDefs;
  worldAddress: Hex;
}): DecodedIndexerQuery => {
  //get all the tables that start with P_
  const configTableQueries = [...Object.keys(tables)]
    .filter((key) => key.startsWith("P_"))
    .map((tableName) => ({ tableId: tables[tableName].tableId }));

  return {
    address: worldAddress as Hex,
    queries: [
      ...configTableQueries,
      { tableId: tables.FunctionSelectors.tableId },
      { tableId: tables.FunctionSignatures.tableId },
      { tableId: tables.Dimensions.tableId },
      { tableId: tables.GracePeriod.tableId },
      { tableId: tables.Reserves.tableId },
      { tableId: tables.VictoryStatus.tableId },
      // main base starting coord
      { tableId: tables.Position.tableId, where: { column: "entity", operation: "eq", value: EntityType.MainBase } },
    ],
  };
};
