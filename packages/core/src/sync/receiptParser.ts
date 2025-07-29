import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { Hex, Log, parseEventLogs, TransactionReceipt } from "viem";

import { StorageAdapterBlock } from "@primodiumxyz/reactive-tables/utils";

/** Parse transaction receipt and extract relevant logs for optimistic updates */
export function parseReceiptLogs(receipt: TransactionReceipt, worldAddress: Hex): StorageAdapterBlock | null {
  if (!receipt.logs || receipt.logs.length === 0) {
    return null;
  }

  // Filter logs that are from the world contract
  const worldLogs = receipt.logs.filter((log) => log.address.toLowerCase() === worldAddress.toLowerCase());

  if (worldLogs.length === 0) {
    return null;
  }

  try {
    // Parse logs using storeEventsAbi just like the RPC subscription system does
    // This creates logs with the proper structure including the 'args' object
    const parsedLogs = parseEventLogs({
      abi: storeEventsAbi,
      logs: worldLogs,
      strict: false, // Allow parsing to continue even if some logs don't match
    });

    console.log(`[receiptParser DEBUG] Parsed ${parsedLogs.length} logs with storeEventsAbi`);
    if (parsedLogs.length > 0) {
      console.log(`[receiptParser DEBUG] First parsed log structure:`, {
        eventName: parsedLogs[0].eventName,
        hasArgs: !!parsedLogs[0].args,
        argsKeys: parsedLogs[0].args ? Object.keys(parsedLogs[0].args) : [],
      });
    }

    // Group logs by block number using the same function as RPC subscription
    const blocks = groupLogsByBlockNumber(parsedLogs) as StorageAdapterBlock[];

    console.log(`[receiptParser DEBUG] Grouped into ${blocks.length} blocks`);

    // Return the first block (should only be one since all logs are from the same transaction)
    return blocks.length > 0 ? blocks[0] : null;
  } catch (error) {
    console.error(`[receiptParser ERROR] Failed to parse logs with storeEventsAbi:`, error);
    console.error(`[receiptParser ERROR] Raw worldLogs:`, worldLogs);
    return null;
  }
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
