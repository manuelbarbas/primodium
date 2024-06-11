import { transportObserver } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";
import { setupRecs } from "@/recs/setupRecs";
import { createWorld } from "@primodiumxyz/reactive-tables";
import { createClock } from "@/network/createClock";
import { otherTables } from "@/network/otherTables";
import { SyncTables } from "@/tables/syncTables";
import { CoreConfig, CreateNetworkResult } from "@/lib/types";

export function createNetwork(config: CoreConfig, syncTables: SyncTables): CreateNetworkResult {
  const world = createWorld();

  const clientOptions = {
    chain: config.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const {
    tables,
    tableDefs,
    storageAdapter,
    triggerUpdateStream,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  } = setupRecs({
    mudConfig,
    world,
    publicClient,
    address: config.worldAddress as Hex,
    otherTables,
    syncTables,
  });

  const clock = createClock(world, latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  return {
    world,
    tables,
    tableDefs,
    storageAdapter,
    triggerUpdateStream,
    publicClient,
    mudConfig,
    clock,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
