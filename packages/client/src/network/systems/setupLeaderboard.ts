import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Score } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { OrderedMap } from "js-sdsl";
import { Account, Leaderboard } from "../components/clientComponents";

export const setupLeaderboard = () => {
  const leaderboard = new OrderedMap<EntityID, number>(
    undefined,
    (x, y) => {
      const xScore = Score.get(x)?.value ?? 0;
      const yScore = Score.get(y)?.value ?? 0;

      return yScore - xScore;
    },
    true
  );

  defineComponentSystem(world, Score, ({ entity, value }) => {
    const entityId = world.entities[entity];
    const player = Account.get()?.value;

    if (!entityId) return;

    leaderboard.setElement(
      entityId,
      parseInt(value?.at(0)?.value.toString() ?? "0")
    );

    let scores: number[] = [];
    let players: EntityID[] = [];

    for (const [player, score] of leaderboard) {
      scores.push(score);
      players.push(player);
    }

    if (!player) {
      Leaderboard.set({
        scores,
        players,
        playerRank: leaderboard.size() + 1,
      });

      return;
    }

    const playerNode = leaderboard.find(player);
    const playerRank =
      player === leaderboard.getElementByPos(playerNode.index)[0]
        ? playerNode.index + 1
        : leaderboard.size() + 1;

    Leaderboard.set({
      scores,
      players,
      playerRank,
    });
  });

  return leaderboard;
};
