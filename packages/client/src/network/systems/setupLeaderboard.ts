import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Pirate, Score } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { Account, Leaderboard } from "../components/clientComponents";

export const setupLeaderboard = () => {
  const leaderboardMap = new Map<EntityID, number>();

  defineComponentSystem(world, Score, ({ entity, value }) => {
    const entityId = world.entities[entity];
    const player = Account.get()?.value;

    if (!entityId || Pirate.has(entityId)) return;

    const scoreValue = parseInt(value?.at(0)?.value.toString() ?? "0");
    leaderboardMap.set(entityId, scoreValue);

    const leaderboardArray = [...leaderboardMap.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    const scores = leaderboardArray.map((entry) => entry[1]);
    const players = leaderboardArray.map((entry) => entry[0]);

    if (!player) {
      Leaderboard.set({
        scores,
        players,
        playerRank: leaderboardArray.length + 1,
      });
      return;
    }

    const playerIndex = players.indexOf(player);
    const playerRank =
      playerIndex !== -1 ? playerIndex + 1 : leaderboardArray.length + 1;

    Leaderboard.set({
      scores,
      players,
      playerRank,
    });
  });

  return leaderboardMap;
};
