import { defineComponentSystem } from "@latticexyz/recs";
import { DoubleCounter } from "../components/clientComponents";
import { SetupResult } from "../types";
import { world } from "../world";

export const setupDoubleCounter = ({ components }: SetupResult) => {
  const { Counter } = components;

  defineComponentSystem(world, Counter, (update) => {
    console.log("updating double counter");
    const value = update?.value[0]?.value ?? 0;
    DoubleCounter.set({ value: Number(value) * 2 });
  });
};
