import { Sync } from "@primodiumxyz/sync-stack";
import { SetupResult } from "../types";
import { getNetworkConfig } from "../config/getNetworkConfig";
import { Hex } from "viem";

export const subToRPC = (setupResult: SetupResult) => {
  const { network } = setupResult;
  const { tables, publicClient, world } = network;
  const networkConfig = getNetworkConfig();

  const sync = Sync.withLiveRPCRecsSync({
    world,
    tables,
    address: networkConfig.worldAddress as Hex,
    publicClient,
  });

  sync.start((_, blockNumber) => {
    console.log("live sync:", blockNumber);
  });

  world.registerDisposer(sync.unsubscribe);
};

export const hydrateFromRPC = (
  setupResult: SetupResult,
  fromBlock: bigint,
  toBlock: bigint,
  onComplete?: () => void
) => {
  const { network, components } = setupResult;
  const { tables, publicClient, world } = network;
  const networkConfig = getNetworkConfig();

  const sync = Sync.withRPCRecsSync({
    world,
    tables,
    address: networkConfig.worldAddress as Hex,
    fromBlock,
    publicClient,
    maxBlockRange: 1n,
    toBlock,
  });

  sync.start((_, __, progress) => {
    components.SyncStatus.set({
      live: false,
      progress,
      message: `Hydrating from RPC`,
    });

    if (progress === 1) {
      onComplete?.();
    }
  });

  world.registerDisposer(sync.unsubscribe);
};
