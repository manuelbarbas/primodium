import { defineRxSystem, namespaceWorld } from "@latticexyz/recs";
import { Core } from "@/lib/types";

export function setupTime({
  tables,
  network: {
    world,
    clock: { time$ },
  },
}: Core) {
  const systemWorld = namespaceWorld(world, "coreSystems");
  defineRxSystem(systemWorld, time$, (time) => {
    tables.Time.set({ value: BigInt(time) });
  });
}
