import { namespaceWorld } from "@latticexyz/recs";
import { SetupResult } from "@/lib/types";

export const setupBlockNumber = (setupResult: SetupResult) => {
  const {
    network: { world, latestBlockNumber$: blockNumber$ },
    components,
  } = setupResult;

  const span = 100;
  const blockTimes: number[] = [];
  let prevBlockTime: number | undefined = undefined;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const blockListener = blockNumber$.subscribe(async (blockNumber) => {
    if (!prevBlockTime) {
      prevBlockTime = Date.now();
      return;
    }

    const timeDifference = (Date.now() - prevBlockTime) / 1000;
    prevBlockTime = Date.now();

    blockTimes.push(timeDifference); // Add the new block time to the queue

    // If we have more than 100 blocks, remove the oldest
    if (blockTimes.length > span) {
      blockTimes.shift();
    }

    // Compute the average over the window (i.e., over the items in the queue)
    const total = blockTimes.reduce((sum, time) => sum + time, 0);
    const avgBlockTime = Math.round(total / blockTimes.length);

    components.BlockNumber.set({ value: blockNumber, avgBlockTime: avgBlockTime });
  });

  systemWorld.registerDisposer(() => blockListener.unsubscribe());
};
