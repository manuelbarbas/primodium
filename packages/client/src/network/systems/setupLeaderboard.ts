import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { world } from "src/network/world";
import { Leaderboard } from "../components/clientComponents";
import { SetupResult } from "../types";
import { components } from "../components";
import { isPlayer } from "src/util/common";

export const setupLeaderboard = (mud: SetupResult) => {
  const leaderboardMap = new Map<Entity, number>();

  defineComponentSystem(world, mud.components.Score, ({ entity, value }) => {
    //don't add alliance entries
    if (components.Alliance.get(entity)) return;

    //check valid player address
    if (!isPlayer(entity)) return;

    const player = mud.network.playerEntity;

    const scoreValue = parseInt(value?.at(0)?.value.toString() ?? "0");
    leaderboardMap.set(entity, scoreValue);

    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => b[1] - a[1]);

    const players = leaderboardArray.map((entry) => entry[0]);
    const scores = leaderboardArray.map((entry) => entry[1]);

    const playerIndex = players.indexOf(player);
    const playerRank = playerIndex !== -1 ? playerIndex + 1 : leaderboardArray.length + 1;

    Leaderboard.set({
      scores,
      players,
      playerRank,
    });
  });

  return leaderboardMap;
};
