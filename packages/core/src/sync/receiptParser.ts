import { storeEventsAbi } from "@latticexyz/store";
import { Hex, Log, TransactionReceipt } from "viem";

import { StorageAdapterBlock } from "@primodiumxyz/reactive-tables/utils";

/**
 * Utility functions to parse transaction receipts and generate optimistic logs that match the format expected by the
 * storage adapter
 */

/** Parse transaction receipt and extract relevant logs for optimistic updates */
export function parseReceiptLogs(receipt: TransactionReceipt, worldAddress: Hex): StorageAdapterBlock | null {
  if (!receipt.logs || receipt.logs.length === 0) {
    console.log(`[ReceiptParser] No logs found in receipt for tx: ${receipt.transactionHash}`);
    return null;
  }

  // Filter logs that are from the world contract
  const worldLogs = receipt.logs.filter((log) => log.address.toLowerCase() === worldAddress.toLowerCase());

  if (worldLogs.length === 0) {
    console.log(`[ReceiptParser] No world contract logs found for tx: ${receipt.transactionHash}`);
    return null;
  }

  console.log(`[ReceiptParser] Found ${worldLogs.length} world contract logs for tx: ${receipt.transactionHash}`);

  // Convert to the format expected by StorageAdapterLog
  const processedLogs = worldLogs.map((log) => ({
    ...log,
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    transactionIndex: receipt.transactionIndex,
    // Ensure we have the required fields
    removed: false,
    logIndex: log.logIndex || 0,
  }));

  return {
    blockNumber: receipt.blockNumber,
    logs: processedLogs,
  };
}

/**
 * Quick validation to check if a transaction receipt contains game-relevant logs This can be used to decide whether to
 * apply optimistic updates
 */
export function hasGameRelevantLogs(receipt: TransactionReceipt, worldAddress: Hex): boolean {
  if (!receipt.logs || receipt.logs.length === 0) {
    return false;
  }

  // Check if any logs are from the world contract
  return receipt.logs.some((log) => log.address.toLowerCase() === worldAddress.toLowerCase());
}

/** Extract transaction metadata that might be useful for debugging or reconciliation */
export function extractTransactionMetadata(receipt: TransactionReceipt) {
  return {
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    blockHash: receipt.blockHash,
    gasUsed: receipt.gasUsed,
    effectiveGasPrice: receipt.effectiveGasPrice,
    status: receipt.status,
    timestamp: Date.now(), // Current timestamp since receipt doesn't include block timestamp
  };
}

/** Simple helper to format logs for debugging */
export function formatLogsForDebug(logs: Log[]): string {
  return logs
    .map((log) => `Log[${log.logIndex}]: ${log.topics[0]?.slice(0, 10)}... (${log.topics.length} topics)`)
    .join(", ");
}
