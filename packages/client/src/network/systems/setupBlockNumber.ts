import { WebSocketProvider } from "@ethersproject/providers";
import { IComputedValue } from "mobx";
import { Observable } from "rxjs";
import { BlockNumber } from "../components/clientComponents";
import { world } from "../world";

const span = 100;
const blockTimes: number[] = [];

export const setupBlockNumber = (
  blockNumber$: Observable<number>,
  providers: IComputedValue<{
    json: any;
    ws: WebSocketProvider | undefined;
  }>
) => {
  const blockListener = blockNumber$.subscribe(async (blockNumber) => {
    const currentBlockTime = (await providers.get().ws?.getBlock(blockNumber))
      ?.timestamp;
    const prevBlockTime = (await providers.get().ws?.getBlock(blockNumber - 1))
      ?.timestamp;

    if (!currentBlockTime || !prevBlockTime) return;

    const timeDifference = currentBlockTime - prevBlockTime;

    blockTimes.push(timeDifference); // Add the new block time to the queue

    // If we have more than 100 blocks, remove the oldest
    if (blockTimes.length > span) {
      blockTimes.shift();
    }

    // Compute the average over the window (i.e., over the items in the queue)
    const total = blockTimes.reduce((sum, time) => sum + time, 0);
    const avgBlockTime = total / blockTimes.length;

    BlockNumber.set({ value: blockNumber, avgBlockTime: avgBlockTime });
  });

  world.registerDisposer(() => blockListener.unsubscribe());
};
