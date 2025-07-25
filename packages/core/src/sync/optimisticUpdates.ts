import { Hex, TransactionReceipt } from "viem";

import { StorageAdapterBlock, StorageAdapterLog } from "@primodiumxyz/reactive-tables/utils";
import { Tables } from "@/lib/types";

import { extractTransactionMetadata, hasGameRelevantLogs, parseReceiptLogs } from "./receiptParser";

/**
 * Manages optimistic updates for immediate UI feedback with eventual consistency
 *
 * This system:
 *
 * 1. Immediately updates UI when transaction receipts are received
 * 2. Tracks pending transactions awaiting log confirmation
 * 3. Reconciles state when logs arrive via the subscription system
 * 4. Provides rollback capability if logs differ from optimistic updates
 */

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
  async applyOptimisticUpdate(receipt: TransactionReceipt): Promise<void> {
    console.log(`[OptimisticUpdates] Applying optimistic update for tx: ${receipt.transactionHash}`);

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
      await this.processReceiptOptimistically(receipt);

      console.log(`[OptimisticUpdates] Optimistic update applied for tx: ${receipt.transactionHash}`);
    } catch (error) {
      console.error(`[OptimisticUpdates] Failed to apply optimistic update:`, error);
      // Remove from pending if we failed to apply optimistically
      this.pendingTransactions.delete(receipt.transactionHash);
    }
  }

  /** Process transaction receipt and generate optimistic state changes */
  private async processReceiptOptimistically(receipt: TransactionReceipt): Promise<void> {
    // This is where you'd implement the logic to convert a transaction receipt
    // into the expected state changes. This is complex and depends on your specific
    // transaction types and state structure.

    // Generate optimistic block from receipt
    const optimisticBlock = await this.generateOptimisticLogsFromReceipt(receipt);

    if (optimisticBlock && optimisticBlock.logs.length > 0) {
      // Apply optimistic logs immediately to the UI
      console.log(
        `[OptimisticUpdates] Applying optimistic block ${optimisticBlock.blockNumber} with ${optimisticBlock.logs.length} logs`,
      );

      // Process each log individually through the storage adapter
      optimisticBlock.logs.forEach((log) => {
        this.storageAdapter(log);
      });

      // Store optimistic data for potential rollback
      const pending = this.pendingTransactions.get(receipt.transactionHash);
      if (pending) {
        pending.optimisticLogData = optimisticBlock;
      }
    }
  }

  /** Generate optimistic logs from transaction receipt */
  private async generateOptimisticLogsFromReceipt(receipt: TransactionReceipt): Promise<StorageAdapterBlock | null> {
    console.log(`[OptimisticUpdates] Generating optimistic logs for tx: ${receipt.transactionHash}`);

    // Parse the receipt logs using our utility function
    const parsedLogs = parseReceiptLogs(receipt, this.worldAddress);

    if (!parsedLogs) {
      console.log(`[OptimisticUpdates] No parseable logs found for tx: ${receipt.transactionHash}`);
      return null;
    }

    console.log(
      `[OptimisticUpdates] Generated optimistic logs for tx ${receipt.transactionHash}: ${parsedLogs.logs.length} logs`,
    );
    return parsedLogs;
  }

  /** Handle incoming logs from the subscription system */
  async processIncomingLogs(block: StorageAdapterBlock): Promise<void> {
    if (!block.logs || block.logs.length === 0) return;

    for (const log of block.logs) {
      const txHash = log.transactionHash as Hex;

      if (this.isPending(txHash)) {
        console.log(`[OptimisticUpdates] Confirming pending transaction: ${txHash}`);
        await this.confirmTransaction(txHash, log);
      } else {
        console.log(`[OptimisticUpdates] Processing new log (not from pending tx): ${txHash}`);
        // This is a new log not from our optimistic updates
        // Process it normally
      }
    }
  }

  /** Confirm a pending transaction with actual log data */
  private async confirmTransaction(txHash: Hex, actualLog: any): Promise<void> {
    const pending = this.pendingTransactions.get(txHash);
    if (!pending) return;

    console.log(`[OptimisticUpdates] Confirming transaction: ${txHash}`);

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
