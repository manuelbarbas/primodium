import { groupLogsByBlockNumber } from "@latticexyz/block-logs-stream";
import { storeEventsAbi } from "@latticexyz/store";
import { Chain, createPublicClient, http, PublicClient, WatchEventReturnType } from "viem";

import { LogFilter, Reader, ReaderSubscribeRpcParams, StorageAdapterBlock } from "@primodiumxyz/sync-stack/types";

import { createLogFilter } from "../common";

// Extended params to include chain config for multi-RPC support
type EnhancedReaderSubscribeRpcParams = ReaderSubscribeRpcParams & {
  chain?: Chain;
};

type Subscription = {
  id: number;
  filter: LogFilter["filters"];
  callback: (block: StorageAdapterBlock) => void;
};

type ConnectionHealth = {
  lastLogTime: number;
  isHealthy: boolean;
  reconnectAttempts: number;
  lastPolledBlock: bigint;
  pollingInterval?: NodeJS.Timeout;
  currentFallbackIndex: number; // Track which fallback RPC we're using
  fallbackRpcClients: Map<string, PublicClient>; // Cache RPC clients
};

const clients = new Map<PublicClient, Subscription[]>();
const clientWatchers = new Map<PublicClient, WatchEventReturnType>();
const connectionHealth = new Map<PublicClient, ConnectionHealth>();

/** Subscribes to logs for a given public client. */
function subscribe(
  publicClient: PublicClient,
  filter: LogFilter["filters"],
  callback: (block: StorageAdapterBlock) => void,
): number {
  const subs = clients.get(publicClient);

  if (!subs) return -1;

  const id = subs.length;
  subs.push({ id, filter, callback });
  console.log(`[robustSubscribeLogs DEBUG] Added subscription ${id}, total: ${subs.length}`);
  return id;
}

/** Unsubscribes from logs for a given public client. */
function unsubscribe(publicClient: PublicClient, subscriptionId: number): void {
  const subs = clients.get(publicClient);

  if (!subs) return;

  if (subs.length === 1) {
    console.log(`[robustSubscribeLogs DEBUG] Last subscription removed, cleaning up`);

    // Stop polling
    const health = connectionHealth.get(publicClient);
    if (health?.pollingInterval) {
      clearInterval(health.pollingInterval);
    }

    // Unsubscribe from watch event
    clientWatchers.get(publicClient)?.();

    // Remove client registration
    clients.delete(publicClient);
    clientWatchers.delete(publicClient);
    connectionHealth.delete(publicClient);
    return;
  }

  clients.set(
    publicClient,
    subs.filter((sub) => sub.id !== subscriptionId),
  );
}

/** Polls for logs using rotating fallback RPCs for maximum reliability */
async function pollWithFallbackRPCs(primaryClient: PublicClient, address: `0x${string}`, chain?: Chain) {
  const health = connectionHealth.get(primaryClient);
  if (!health) return;

  // Get fallback RPCs from chain config
  const fallbackRpcUrls = chain?.rpcUrls?.fallback?.http || [];

  if (fallbackRpcUrls.length === 0) {
    // No fallback RPCs configured, use primary client
    return pollForLogs(primaryClient, address);
  }

  // Rotate through fallback RPCs
  const currentRpcUrl = fallbackRpcUrls[health.currentFallbackIndex % fallbackRpcUrls.length];
  let fallbackClient = health.fallbackRpcClients.get(currentRpcUrl);

  // Create client if not cached
  if (!fallbackClient && chain) {
    fallbackClient = createPublicClient({
      chain,
      transport: http(currentRpcUrl),
    });
    health.fallbackRpcClients.set(currentRpcUrl, fallbackClient);
  }

  if (!fallbackClient) {
    console.warn(`[robustSubscribeLogs MULTI-RPC] Could not create fallback client for ${currentRpcUrl}`);
    return;
  }

  try {
    const currentBlock = await fallbackClient.getBlockNumber();
    const fromBlock = health.lastPolledBlock + 1n;

    // Only poll if we have new blocks
    if (fromBlock > currentBlock) {
      health.currentFallbackIndex++; // Move to next RPC for next poll
      return;
    }

    console.log(
      `[robustSubscribeLogs MULTI-RPC] Checking blocks ${fromBlock} to ${currentBlock} via RPC ${(health.currentFallbackIndex % fallbackRpcUrls.length) + 1}/${fallbackRpcUrls.length}`,
    );

    const logs = await fallbackClient.getLogs({
      address,
      fromBlock,
      toBlock: currentBlock,
      events: storeEventsAbi,
      strict: true,
    });

    // Always log what we're checking, even if no logs found
    console.log(
      `[robustSubscribeLogs MULTI-RPC] Scanned blocks ${fromBlock}-${currentBlock}: found ${logs.length} logs`,
    );
    if (logs.length > 0) {
      console.log(
        `[robustSubscribeLogs MULTI-RPC] Found log blocks: ${[...new Set(logs.map((l) => l.blockNumber.toString()))].join(", ")}`,
      );
      console.log(
        `[robustSubscribeLogs MULTI-RPC] Found tx hashes: ${[...new Set(logs.map((l) => l.transactionHash))].join(", ")}`,
      );
    }

    if (logs.length > 0) {
      console.log(
        `[robustSubscribeLogs MULTI-RPC] SUCCESS: Found ${logs.length} logs via RPC fallback (${currentRpcUrl}) - WebSocket missed these!`,
      );

      // Process logs the same way as WebSocket subscription
      const subs = clients.get(primaryClient);
      subs?.forEach(({ filter, callback }) => {
        const filteredLogs = filter ? logs.filter(createLogFilter(filter)) : logs;
        const blocks = groupLogsByBlockNumber(filteredLogs) as StorageAdapterBlock[];

        for (const block of blocks) {
          console.log(
            `[robustSubscribeLogs MULTI-RPC] Processing fallback RPC block ${block.blockNumber} with ${block.logs.length} logs`,
          );
          callback(block);
        }
      });

      // Mark as activity to prevent health check failures
      health.lastLogTime = Date.now();
    }

    // Update last polled block and rotate to next RPC
    health.lastPolledBlock = currentBlock;
    health.currentFallbackIndex++;
  } catch (error) {
    console.warn(`[robustSubscribeLogs MULTI-RPC] RPC ${currentRpcUrl} failed:`, error);
    // Move to next RPC on error
    health.currentFallbackIndex++;
  }
}

/** Polls for logs as a fallback (single RPC version) */
async function pollForLogs(publicClient: PublicClient, address: `0x${string}`) {
  try {
    const health = connectionHealth.get(publicClient);
    if (!health) return;

    const currentBlock = await publicClient.getBlockNumber();
    const fromBlock = health.lastPolledBlock + 1n;

    // Only poll if we have new blocks
    if (fromBlock > currentBlock) {
      return;
    }

    console.log(`[robustSubscribeLogs POLL] Checking blocks ${fromBlock} to ${currentBlock}`);

    const logs = await publicClient.getLogs({
      address,
      fromBlock,
      toBlock: currentBlock,
      events: storeEventsAbi,
      strict: true,
    });

    // Always log what we're checking, even if no logs found
    console.log(`[robustSubscribeLogs POLL] Scanned blocks ${fromBlock}-${currentBlock}: found ${logs.length} logs`);
    if (logs.length > 0) {
      console.log(
        `[robustSubscribeLogs POLL] Found log blocks: ${[...new Set(logs.map((l) => l.blockNumber.toString()))].join(", ")}`,
      );
      console.log(
        `[robustSubscribeLogs POLL] Found tx hashes: ${[...new Set(logs.map((l) => l.transactionHash))].join(", ")}`,
      );
    }

    if (logs.length > 0) {
      console.log(
        `[robustSubscribeLogs POLL] Found ${logs.length} logs via polling - WebSocket might have missed these!`,
      );

      // Process logs the same way as WebSocket subscription
      const subs = clients.get(publicClient);
      subs?.forEach(({ filter, callback }) => {
        const filteredLogs = filter ? logs.filter(createLogFilter(filter)) : logs;
        const blocks = groupLogsByBlockNumber(filteredLogs) as StorageAdapterBlock[];

        for (const block of blocks) {
          console.log(
            `[robustSubscribeLogs POLL] Processing polled block ${block.blockNumber} with ${block.logs.length} logs`,
          );
          callback(block);
        }
      });

      // Mark as activity to prevent health check failures
      health.lastLogTime = Date.now();
    }

    // Update last polled block
    health.lastPolledBlock = currentBlock;
  } catch (error) {
    console.error(`[robustSubscribeLogs POLL ERROR]:`, error);
  }
}

/** Initializes a watch event for a given public client with polling fallback. */
function initializeWatchEvent(args: EnhancedReaderSubscribeRpcParams) {
  const { publicClient, address, chain } = args;

  // Set client with empty subscriptions
  clients.set(publicClient, []);

  // Initialize connection health tracking
  const currentBlock = publicClient.getBlockNumber().then((block) => {
    connectionHealth.set(publicClient, {
      lastLogTime: Date.now(),
      isHealthy: true,
      reconnectAttempts: 0,
      lastPolledBlock: block,
      currentFallbackIndex: 0,
      fallbackRpcClients: new Map(),
    });

    // Start multi-RPC polling fallback (every 5 seconds)
    const pollingInterval = setInterval(() => {
      const now = new Date().toISOString();
      console.log(`[robustSubscribeLogs POLL-TIMER] ${now} - Triggering multi-RPC polling`);
      pollWithFallbackRPCs(publicClient, address, chain);
    }, 5000);

    const health = connectionHealth.get(publicClient);
    if (health) {
      health.pollingInterval = pollingInterval;
    }
  });

  const unsub = publicClient.watchEvent({
    onLogs: (logs) => {
      const subs = clients.get(publicClient);
      const health = connectionHealth.get(publicClient);

      console.log(`[robustSubscribeLogs WEBSOCKET] Received ${logs.length} logs from WebSocket subscription`);

      if (logs.length > 0) {
        console.log(`[robustSubscribeLogs WEBSOCKET] First log:`, {
          blockNumber: logs[0].blockNumber,
          transactionHash: logs[0].transactionHash,
          address: logs[0].address,
          topics: logs[0].topics?.slice(0, 2), // Limit topics for cleaner logs
        });

        // Update health - we're receiving logs
        if (health) {
          health.lastLogTime = Date.now();
          health.isHealthy = true;
          health.reconnectAttempts = 0;
        }
      }

      if (!subs || subs.length === 0) {
        console.warn(`[robustSubscribeLogs WEBSOCKET] No subscribers, unsubscribing`);
        unsub();
        clients.delete(publicClient);
        clientWatchers.delete(publicClient);
        return;
      }

      subs.forEach(({ filter, callback }) => {
        const filteredLogs = filter ? logs.filter(createLogFilter(filter)) : logs;
        const blocks = groupLogsByBlockNumber(filteredLogs) as StorageAdapterBlock[];

        console.log(
          `[robustSubscribeLogs WEBSOCKET] Processing: ${logs.length} raw → ${filteredLogs.length} filtered → ${blocks.length} blocks`,
        );

        for (const block of blocks) {
          console.log(
            `[robustSubscribeLogs WEBSOCKET] Processing WebSocket block ${block.blockNumber} with ${block.logs.length} logs`,
          );
          callback(block);
        }
      });
    },
    events: storeEventsAbi,
    address: address,
    strict: true,
    onError: (error) => {
      console.error(`[robustSubscribeLogs WEBSOCKET ERROR]:`, error);
      const health = connectionHealth.get(publicClient);
      if (health) {
        health.isHealthy = false;
        health.reconnectAttempts++;
      }
    },
  });

  clientWatchers.set(publicClient, unsub);

  // Health monitoring - check if WebSocket is working
  setInterval(() => {
    const health = connectionHealth.get(publicClient);
    if (!health) return;

    const timeSinceLastLog = Date.now() - health.lastLogTime;
    const HEALTH_TIMEOUT = 30000; // 30 seconds
    const now = new Date().toISOString();

    console.log(
      `[robustSubscribeLogs HEALTH-CHECK] ${now} - Health: ${health.isHealthy}, Last log: ${timeSinceLastLog}ms ago, Last polled block: ${health.lastPolledBlock}`,
    );

    if (timeSinceLastLog > HEALTH_TIMEOUT && health.isHealthy) {
      console.warn(
        `[robustSubscribeLogs HEALTH] ${now} - WebSocket seems unhealthy - no logs for ${timeSinceLastLog}ms. Polling will handle missed events.`,
      );
      health.isHealthy = false;
    }
  }, 10000); // Check every 10 seconds
}

/** Enhanced subscribeLogs with WebSocket + Multi-RPC Polling hybrid approach */
export function robustSubscribeLogs(args: EnhancedReaderSubscribeRpcParams): Reader {
  const fallbackRpcCount = args.chain?.rpcUrls?.fallback?.http?.length || 0;

  if (!clients.has(args.publicClient)) {
    initializeWatchEvent(args);
  }

  return {
    subscribe: (userCallback) => {
      const subscriptionId = subscribe(args.publicClient, args.logFilter, userCallback);
      console.log(`[robustSubscribeLogs INIT] Created subscription ${subscriptionId} with enhanced debugging`);
      return () => unsubscribe(args.publicClient, subscriptionId);
    },
  };
}
