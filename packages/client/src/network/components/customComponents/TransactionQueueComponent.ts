import { useEffect, useState } from "react";
import { Metadata, Type, Entity } from "@latticexyz/recs";
import { world } from "src/network/world";
import { Options, createExtendedComponent } from "./ExtendedComponent";
import { TransactionQueue } from "../clientComponents";

export function createTransactionQueueComponent<M extends Metadata>(options?: Options<M>) {
  const queue: { system: string; fn: () => Promise<void> }[] = [];
  let isRunning = false;

  const component = createExtendedComponent(
    world,
    {
      value: Type.String,
    },
    options
  );

  // Add a function to the queue
  function enqueue(fn: () => Promise<void>, value: string, system: string) {
    if (component.has(system as Entity)) return;

    component.set(
      {
        value,
      },
      system as Entity
    );

    queue.push({
      system,
      fn,
    });

    run();
  }

  async function run() {
    if (isRunning) return; // If it's already running, don't start another process
    isRunning = true;

    while (queue.length) {
      const tx = queue.shift(); // Get the first function from the queue

      if (!tx) continue;

      const { system, fn } = tx;

      if (fn) {
        try {
          component.remove(system as Entity);
          await fn(); // Run the function and await its completion
        } catch (error) {
          console.error("Error executing function:", error);
        }
      }
    }

    isRunning = false;
  }

  function getIndex(system: string) {
    return queue.findIndex((item) => item.system === system);
  }

  function useIndex(system: string) {
    const [position, setPosition] = useState<number>(-1);

    useEffect(() => {
      const sub = TransactionQueue.update$.subscribe(() => {
        const position = getIndex(system);
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
