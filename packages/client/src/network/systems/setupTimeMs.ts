import { defineRxSystem } from "@latticexyz/recs";
import { components } from "../components";
import { SetupResult } from "../types";
import { world } from "../world";

export function setupTimeMs({
  network: {
    clock: { time$ },
  },
}: SetupResult) {
  defineRxSystem(world, time$, (time) => {
    components.TimeMs.set({ value: BigInt(time) });
  });
}
