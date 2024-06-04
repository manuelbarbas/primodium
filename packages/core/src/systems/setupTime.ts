import { defineRxSystem, namespaceWorld } from "@latticexyz/recs";
import { SetupResult } from "@/lib/types";

export function setupTime({
  components,
  network: {
    world,
    clock: { time$ },
  },
}: SetupResult) {
  const systemWorld = namespaceWorld(world, "coreSystems");
  defineRxSystem(systemWorld, time$, (time) => {
    components.Time.set({ value: BigInt(time) });
  });
}
