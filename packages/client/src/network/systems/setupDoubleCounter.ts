import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { SetupResult } from "../types";
import { world } from "../world";

export const setupDoubleCounter = ({ components }: SetupResult) => {
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemWorld, components.Counter, (update) => {
    const value = update?.value[0]?.value ?? 0;
    components.DoubleCounter.set({ value: BigInt(value) * BigInt(2) });
  });
};
