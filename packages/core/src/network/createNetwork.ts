import { transportObserver } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";
import { setupRecs } from "@/recs/setupRecs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createWorld } from "@latticexyz/recs";
import { createClock } from "@/network/createClock";
import { otherTables } from "@/network/otherTables";
import { extendContractComponents } from "@/tables/customTables/extendComponents";
import { CoreConfig, CreateNetworkResult } from "@/lib/types";

export function createNetwork(config: CoreConfig): CreateNetworkResult {
  const world = createWorld();
  world.registerEntity({ id: singletonEntity });

  const clientOptions = {
    chain: config.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const { tables, latestBlock$, latestBlockNumber$, rawTables, storedBlockLogs$, waitForTransaction } = setupRecs({
    mudConfig,
    world,
    publicClient,
    address: config.worldAddress as Hex,
    otherTables,
  });

  const clock = createClock(world, latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  return {
    world,
    rawTables,
    publicClient,
    mudConfig,
    tables: extendContractComponents(tables),
    clock,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
