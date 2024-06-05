import { Sync } from "@primodiumxyz/sync-stack";
import { Hex } from "viem";
import { Entity } from "@latticexyz/recs";
import { Core, SyncStep } from "@/lib/types";

export const subToRPC = (core: Core) => {
  const { network, config } = core;
  const { tables, publicClient, world } = network;

  const sync = Sync.withLiveRPCRecsSync({
    world,
    tables,
    address: config.worldAddress as Hex,
    publicClient,
  });

  sync.start((_, blockNumber) => {
    console.log("syncing updates on block:", blockNumber);
  });

  world.registerDisposer(sync.unsubscribe);
};

export const hydrateFromRPC = (
  core: Core,
  fromBlock: bigint,
  toBlock: bigint,
  onComplete?: () => void,
  onError?: (err: unknown) => void,
  syncId?: Entity
) => {
  const { network, components, config } = core;
  const { tables, publicClient, world } = network;

  const sync = Sync.withRPCRecsSync({
    world,
    tables,
    address: config.worldAddress as Hex,
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
