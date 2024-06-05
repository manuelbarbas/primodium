import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Core } from "@/lib/types";

export const setupDoubleCounter = (core: Core) => {
  const {
    network: { world },
    components,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, components.Counter, (update) => {
    const value = update?.value[0]?.value ?? 0;
    components.DoubleCounter.set({ value: BigInt(value) * BigInt(2) });
  });
};
