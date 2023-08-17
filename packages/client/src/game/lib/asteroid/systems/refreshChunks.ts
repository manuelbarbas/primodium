import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Level } from "src/network/components/chainComponents";
import { world } from "src/network/world";

export function refreshChunks(player: EntityID) {
  defineComponentSystem(world, Level, ({ entity }) => {
    if (world.entities[entity] != player) return;
  });
}
