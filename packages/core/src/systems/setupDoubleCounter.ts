import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { SetupResult } from "@/lib/types";

export const setupDoubleCounter = (setupResult: SetupResult) => {
  const {
    network: { world },
    components,
  } = setupResult;

  const systemWorld = namespaceWorld(world, "coreSystems");

  defineComponentSystem(systemWorld, components.Counter, (update) => {
    const value = update?.value[0]?.value ?? 0;
    components.DoubleCounter.set({ value: BigInt(value) * BigInt(2) });
  });
};
