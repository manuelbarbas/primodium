import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Core } from "@/lib/types";

export const setupDoubleCounter = (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, tables.Counter, (update) => {
    const value = update?.value[0]?.value ?? 0;
    tables.DoubleCounter.set({ value: BigInt(value) * BigInt(2) });
  });
};
