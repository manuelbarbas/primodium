import { LogFilter, StorageAdapterBlock, StoreEventsLog } from "@primodiumxyz/sync-stack/types";

import { getValidAuthToken } from "./authStorage";

/**
 * Checks if a given object can be processed as a {@link StorageAdapterBlock}.
 *
 * @param data - The object to check
 * @returns Whether the object is a {@link StorageAdapterBlock}
 */
export function isStorageAdapterBlock(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any,
): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string } {
  return data && typeof data.blockNumber === "string" && Array.isArray(data.logs);
}

/**
 * Checks if a given object can be processed as a {@link StorageAdapterBlock} from an indexer.
 *
 * @param data - The object to check
 * @returns Whether the object is a {@link StorageAdapterBlock} from an indexer
 */
export function isStorageAdapterBlockIndexer(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  data: any,
): data is Omit<StorageAdapterBlock, "blockNumber"> & { blockNumber: string; chunk: number; totalChunks: number } {
  return (
    data &&
    typeof data.blockNumber === "string" &&
    Array.isArray(data.logs) &&
    typeof data.chunk === "number" &&
    typeof data.totalChunks === "number"
  );
}

/**
 * Creates a filter function for {@link StoreEventsLog} based on the provided filters.
 *
 * @param filters - The filters to apply
 * @returns A function that can filter {@link StoreEventsLog}
 */
export const createLogFilter =
  (filters: NonNullable<LogFilter["filters"]>) =>
  (log: StoreEventsLog): boolean =>
    filters.some(
      (filter) =>
        filter.tableId === log.args.tableId &&
        (filter.key0 == null || filter.key0 === log.args.keyTuple[0]) &&
        (filter.key1 == null || filter.key1 === log.args.keyTuple[1]),
    );
