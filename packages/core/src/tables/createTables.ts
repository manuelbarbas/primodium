import setupCoreTables from "@/tables/coreTables";
import { SyncTables } from "@/tables/syncTables";
import { Tables, CreateNetworkResult } from "@/lib/types";

export function createTables(network: CreateNetworkResult, syncTables: SyncTables): Tables {
  const coreTables = setupCoreTables(network);

  return {
    ...network.tables,
    ...coreTables,
    ...syncTables,
  };
}
