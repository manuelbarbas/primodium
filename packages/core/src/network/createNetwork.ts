import { transportObserver } from "@latticexyz/common";
import mudConfig from "contracts/mud.config";
import { Hex, createPublicClient, fallback, http } from "viem";
import { getNetworkConfig } from "./config/networkConfig";
import { setupRecs } from "../recs/setupRecs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { createWorld } from "@latticexyz/recs";
import { createClock } from "@/network/createClock";
import { otherTables } from "@/network/otherTables";
import { extendContractComponents } from "@/components/customComponents/extendComponents";

export let network: ReturnType<typeof _createNetwork>;

export function createNetwork() {
  if (network) return network;
  return _createNetwork();
}

function _createNetwork() {
  const world = createWorld();
  world.registerEntity({ id: singletonEntity });

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

  const clock = createClock(world, latestBlock$, {
    period: 1100,
    initialTime: 0,
    syncInterval: 10000,
  });

  const networkResult = {
    world,
    tables,
    publicClient,
    config: networkConfig,
    mudConfig,
    components: extendContractComponents(components),
    clock,
    latestBlock$,
    latestBlockNumber$,
    storedBlockLogs$,
    waitForTransaction,
  };

  network = networkResult;
  return networkResult;
}
