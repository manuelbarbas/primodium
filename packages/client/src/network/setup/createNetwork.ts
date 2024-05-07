import { otherTables } from "@/network/otherTables";
import { transportObserver } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { createClock } from "../createClock";
import { world } from "../world";
import { setupRecs } from "./setupRecs";

export let network: ReturnType<typeof _createNetwork>;

export function createNetwork() {
  if (network) return network;
  return _createNetwork();
}

function _createNetwork() {
  const networkConfig = getNetworkConfig();
  const clientOptions = {
    chain: networkConfig.chain,
    transport: transportObserver(fallback([http()])),
    pollingInterval: 1000,
  };

  const publicClient = createPublicClient(clientOptions);

  const { components, latestBlock$, latestBlockNumber$, tables, storedBlockLogs$, waitForTransaction } = setupRecs({
    mudConfig,
    world,
    publicClient,
    address: networkConfig.worldAddress as Hex,
    otherTables,
  });

  const clock = createClock(latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  const networkResult = {
    world,
    tables,
    publicClient,
    mudConfig,
    components,
    clock,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };

  network = networkResult;
  return networkResult;
}
