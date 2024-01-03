import { transportObserver } from "@latticexyz/common";
import { syncToRecs } from "@latticexyz/store-sync/recs";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { createClock } from "../createClock";
import { otherTables } from "../otherTables";
import { world } from "../world";

export async function setupNetwork() {
  const networkConfig = getNetworkConfig();
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const { components, latestBlock$, latestBlockNumber$, storedBlockLogs$, waitForTransaction } = await syncToRecs({
    world,
    config: mudConfig,
    address: networkConfig.worldAddress as Hex,
    publicClient,
    startBlock: BigInt(networkConfig.initialBlockNumber),
    indexerUrl: networkConfig.indexerUrl,
    tables: otherTables,
  });

  const clock = createClock(latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });
  return {
    world,
    publicClient,
    mudConfig,
    components,
    clock,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };
}
