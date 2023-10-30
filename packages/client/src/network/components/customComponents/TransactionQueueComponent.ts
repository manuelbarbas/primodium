import { useEffect, useState } from "react";
import { Metadata, Type, Entity } from "@latticexyz/recs";
import { world } from "src/network/world";
import { Options, createExtendedComponent } from "./ExtendedComponent";
import { TransactionQueue } from "../clientComponents";
import { TransactionQueueType } from "src/util/constants";

export function createTransactionQueueComponent<M extends Metadata>(options?: Options<M>) {
  const queue: { id: Entity; fn: () => Promise<void> }[] = [];
  let isRunning = false;

  const component = createExtendedComponent(
    world,
    {
      value: Type.OptionalString,
      type: Type.Number,
    },
    options
  );

  // Add a function to the queue
  async function enqueue(fn: () => Promise<void>, id: Entity, type: TransactionQueueType, value?: string) {
    if (component.has(id)) return;
    queue.push({
      id,
      fn,
    });

    component.set(
      {
        value,
        type,
      },
      id
    );

    await run();
  }

  async function run() {
    if (isRunning) return; // If it's already running, don't start another process
    isRunning = true;

    while (queue.length) {
      const tx = queue[0]; // Get the first function from the queue

      if (!tx) continue;

      const { id, fn } = tx;

      if (fn) {
        try {
          await fn(); // Run the function and await its completion
        } catch (error) {
          console.error("Error executing function:", error);
        } finally {
          queue.shift(); // Remove the function from the queue
          component.remove(id);
        }
      }
    }

    isRunning = false;
  }

  function getIndex(id: Entity) {
    return queue.findIndex((item) => item.id === id);
  }

  function useIndex(id: Entity) {
    const [position, setPosition] = useState<number>(-1);

    useEffect(() => {
      const sub = TransactionQueue.update$.subscribe(() => {
        const position = getIndex(id);
        setPosition(position);
      });

      return () => {
        sub.unsubscribe();
      };
    }, []);

    return position;
  }

  return {
    ...component,
    enqueue,
    run,
    getIndex,
    useIndex,
  };
}
