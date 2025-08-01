import { Hex, TransactionReceipt } from "viem";

import { StorageAdapterBlock, StorageAdapterLog } from "@primodiumxyz/reactive-tables/utils";
import { Tables } from "@/lib/types";

import { extractTransactionMetadata, hasGameRelevantLogs, parseReceiptLogs } from "./receiptParser";

export interface PendingTransaction {
  transactionHash: Hex;
  receipt: TransactionReceipt;
  timestamp: number;
  optimisticLogData?: any; // Store optimistic state for potential rollback
}

export class OptimisticUpdateManager {
  private pendingTransactions = new Map<Hex, PendingTransaction>();
  private tables: Tables;
  private storageAdapter: (logs: StorageAdapterLog) => void;
  private worldAddress: Hex;

  // Configuration
  private readonly PENDING_TIMEOUT = 30000; // 30 seconds before considering a transaction lost
  private readonly MAX_PENDING_TRANSACTIONS = 100; // Prevent memory leaks

  constructor(tables: Tables, storageAdapter: (logs: StorageAdapterLog) => void, worldAddress: Hex) {
    this.tables = tables;
    this.storageAdapter = storageAdapter;
    this.worldAddress = worldAddress;

    // Cleanup old pending transactions periodically
    setInterval(() => this.cleanupOldTransactions(), 10000);
  }

  /** Apply optimistic update immediately when transaction receipt is received */
  applyOptimisticUpdate(receipt: TransactionReceipt): void {
    // Check if this transaction has game-relevant logs
    if (!hasGameRelevantLogs(receipt, this.worldAddress)) {
      console.log(
        `[OptimisticUpdates] No game-relevant logs found for tx: ${receipt.transactionHash}, skipping optimistic update`,
      );
      return;
    }

    try {
      // Mark transaction as pending confirmation
      this.markAsPending(receipt.transactionHash, receipt);

      // Apply immediate optimistic state update
      this.processReceiptOptimistically(receipt);
    } catch (error) {
      console.error(`[OptimisticUpdates] Failed to apply optimistic update:`, error);
      // Remove from pending if we failed to apply optimistically
      this.pendingTransactions.delete(receipt.transactionHash);
    }
  }

  private processReceiptOptimistically(receipt: TransactionReceipt): void {
    // Generate optimistic block from receipt
    const optimisticBlock = this.generateOptimisticLogsFromReceipt(receipt);

    if (optimisticBlock && optimisticBlock.logs.length > 0) {
      optimisticBlock.logs.forEach((log, index) => {
        try {
          this.storageAdapter(log);
        } catch (error) {
          console.error(`[OptimisticUpdates DEBUG] storageAdapter call ${index + 1} failed:`, error);
        }
      });

      // Store optimistic data for potential rollback
      const pending = this.pendingTransactions.get(receipt.transactionHash);
      if (pending) {
        pending.optimisticLogData = optimisticBlock;
      }
    }
  }

  private generateOptimisticLogsFromReceipt(receipt: TransactionReceipt): StorageAdapterBlock | null {
    // Parse the receipt logs using our utility function
    const parsedLogs = parseReceiptLogs(receipt, this.worldAddress);

    if (!parsedLogs) {
      return null;
    }
    return parsedLogs;
  }

  /** Handle incoming logs from the subscription system */
  processIncomingLogs(block: StorageAdapterBlock): void {
    if (!block.logs || block.logs.length === 0) return;

    for (const log of block.logs) {
      const txHash = log.transactionHash as Hex;

      if (this.isPending(txHash)) {
        this.confirmTransaction(txHash, log);
      } else {
        console.log(`[OptimisticUpdates] Processing new log (not from pending tx): ${txHash}`);
      }
    }
  }

  /** Confirm a pending transaction with actual log data */
  private confirmTransaction(txHash: Hex, actualLog: any): void {
    const pending = this.pendingTransactions.get(txHash);
    if (!pending) return;
    // TODO: Implement reconciliation logic
    // Compare actualLog with pending.optimisticLogData
    // If they differ, apply corrections to the state

    // For now, just mark as confirmed and remove from pending
    this.markAsConfirmed(txHash);

    console.log(`[OptimisticUpdates] Transaction confirmed and removed from pending: ${txHash}`);
  }

  /** Mark transaction as pending confirmation */
  private markAsPending(txHash: Hex, receipt: TransactionReceipt): void {
    // Prevent memory leaks by limiting pending transactions
    if (this.pendingTransactions.size >= this.MAX_PENDING_TRANSACTIONS) {
      console.warn(`[OptimisticUpdates] Max pending transactions reached, cleaning up oldest`);
      this.cleanupOldTransactions();
    }

    this.pendingTransactions.set(txHash, {
      transactionHash: txHash,
      receipt,
      timestamp: Date.now(),
    });

    console.log(`[OptimisticUpdates] Marked transaction as pending: ${txHash}`);
  }

  /** Mark transaction as confirmed and remove from pending */
  private markAsConfirmed(txHash: Hex): void {
    this.pendingTransactions.delete(txHash);
  }

  /** Check if transaction is pending confirmation */
  isPending(txHash: Hex): boolean {
    return this.pendingTransactions.has(txHash);
  }

  /** Get all pending transaction hashes */
  getPendingTransactions(): Hex[] {
    return Array.from(this.pendingTransactions.keys());
  }

  /** Clean up old pending transactions that likely won't be confirmed */
  private cleanupOldTransactions(): void {
    const now = Date.now();
    const toRemove: Hex[] = [];

    for (const [txHash, pending] of this.pendingTransactions.entries()) {
      if (now - pending.timestamp > this.PENDING_TIMEOUT) {
        console.warn(`[OptimisticUpdates] Removing stale pending transaction: ${txHash}`);
        toRemove.push(txHash);
      }
    }

    toRemove.forEach((txHash) => this.pendingTransactions.delete(txHash));

    if (toRemove.length > 0) {
      console.log(`[OptimisticUpdates] Cleaned up ${toRemove.length} stale pending transactions`);
    }
  }

  /** Get debug information about pending transactions */
  getDebugInfo(): object {
    return {
      pendingCount: this.pendingTransactions.size,
      pendingTransactions: Array.from(this.pendingTransactions.entries()).map(([txHash, pending]) => ({
        txHash,
        age: Date.now() - pending.timestamp,
        blockNumber: pending.receipt.blockNumber,
      })),
    };
  }
}
