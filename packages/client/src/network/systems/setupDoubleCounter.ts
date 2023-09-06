import { defineComponentSystem } from "@latticexyz/recs";
import { DoubleCounter } from "../components/createComponents";
import { SetupNetworkResult } from "../types";
import { world } from "../world";

export const setupDoubleCounter = ({ components }: SetupNetworkResult) => {
  const { Counter } = components;

  defineComponentSystem(world, Counter, (update) => {
    const value = update?.value[0]?.value ?? 0;
    DoubleCounter.set({ value: value * 2 });
  });
};
