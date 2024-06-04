import { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";
import { SyncStep } from "src/util/constants";
import { Entity } from "@latticexyz/recs";
import { SetupResult } from "@/types";

export const subToRPC = (setupResult: SetupResult) => {
  const { network } = setupResult;
  const { tables, publicClient, world, config: networkConfig } = network;

  const sync = Sync.withLiveRPCRecsSync({
    world,
    tables,
    address: networkConfig.worldAddress as Hex,
    publicClient,
  });

  sync.start((_, blockNumber) => {
    console.log("syncing updates on block:", blockNumber);
  });

  world.registerDisposer(sync.unsubscribe);
};

export const hydrateFromRPC = (
  setupResult: SetupResult,
  fromBlock: bigint,
  toBlock: bigint,
  onComplete?: () => void,
  onError?: (err: unknown) => void,
  syncId?: Entity
) => {
  const { network, components } = setupResult;
  const { tables, publicClient, world, config: networkConfig } = network;

  const sync = Sync.withRPCRecsSync({
    world,
    tables,
    address: networkConfig.worldAddress as Hex,
    fromBlock,
    publicClient,
    toBlock,
  });

  sync.start((_, __, progress) => {
    components.SyncStatus.set(
      {
        step: SyncStep.Syncing,
        progress,
        message: `Hydrating from RPC`,
      },
      syncId
    );

    if (progress === 1) {
      components.SyncStatus.set(
        {
          step: SyncStep.Complete,
          progress: 1,
          message: `DONE`,
        },
        syncId
      );

      onComplete?.();
    }
  }, onError);

  world.registerDisposer(sync.unsubscribe);
};
