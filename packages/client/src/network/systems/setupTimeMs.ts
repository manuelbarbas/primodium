import { defineRxSystem } from "@latticexyz/recs";
import { components } from "../components";
import { SetupResult } from "../types";
import { world } from "../world";

export function setupTime({
  network: {
    clock: { time$ },
  },
}: SetupResult) {
  defineRxSystem(world, time$, (time) => {
    components.Time.set({ value: BigInt(time) });
  });
}
