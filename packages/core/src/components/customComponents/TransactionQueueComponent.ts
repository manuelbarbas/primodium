import { Entity, Metadata, Type } from "@latticexyz/recs";
import { useEffect, useState } from "react";
import { Options, createExtendedComponent } from "./ExtendedComponent";
import { CreateNetworkResult } from "@/lib/types";

export type TxQueueOptions<M extends Metadata> = {
  id: string;
  force?: true;
  metadata?: M;
};

export function createTransactionQueueComponent<M extends Metadata>(
  { world }: CreateNetworkResult,
  options?: Options<M>
) {
  const queue: { id: string; fn: () => Promise<void> }[] = [];
  let isRunning = false;

  const component = createExtendedComponent(
    world,
    {
      metadata: Type.OptionalString,
    },
    options
  );

  // Add a function to the queue
  async function enqueue(fn: () => Promise<any>, options: TxQueueOptions<M>) {
    if (!options.force && component.has(options.id as Entity)) return;

    queue.push({
      id: options.id,
      fn,
    });

    component.set(
      {
        metadata: JSON.stringify(options?.metadata),
      },
      options.id as Entity
    );

    await run();
  }

  async function run() {
    if (isRunning) return;
    isRunning = true;

    while (queue.length) {
      const tx = queue[0];

      if (!tx) continue;

      const { id, fn } = tx;

      if (fn) {
        try {
          await fn();
        } catch (error) {
          console.error("Error executing function:", error);
        } finally {
          queue.shift();
          component.remove(id as Entity);
        }
      }
    }

    isRunning = false;
  }

  function getIndex(id: string) {
    return queue.findIndex((item) => item.id === id);
  }

  function getSize() {
    return queue.length;
  }

  function getMetadata(id: string): M | undefined {
    const index = getIndex(id);
    if (index === -1) return undefined;
    return JSON.parse(component.get(id as Entity)?.metadata || "");
  }

  function useIndex(id: string) {
    const [position, setPosition] = useState<number>(getIndex(id));

    useEffect(() => {
      const sub = component.update$.subscribe(() => {
        const position = getIndex(id);
        setPosition(position);
      });

      return () => {
        sub.unsubscribe();
      };
    }, [id]);

    return position;
  }

  function useSize() {
    const [size, setSize] = useState<number>(getSize());

    useEffect(() => {
      const sub = component.update$.subscribe(() => {
        const size = getSize();
        setSize(size);
      });

      return () => {
        sub.unsubscribe();
      };
    }, []);

    return size;
  }

  return {
    ...component,
    enqueue,
    run,
    getIndex,
    useIndex,
    useSize,
    getSize,
    getMetadata,
  };
}
