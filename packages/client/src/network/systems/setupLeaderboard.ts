import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Score } from "src/network/components/chainComponents";
import { world } from "src/network/world";

export const setupLeaderboard = () => {
  const leaderboard = new Map<EntityID, number>();

  defineComponentSystem(world, Score, ({ entity, value }) => {
    const entityId = world.entities[entity];

    if (!entityId) return;

    leaderboard.set(entityId, parseInt(value?.at(0)?.value.toString() ?? "0"));
  });

  return leaderboard;
};
