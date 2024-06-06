import { EntityType } from "@/lib/constants";
import { Components } from "@/lib/types";
import { rankToScore } from "@/utils/global/score";
import { Entity } from "@latticexyz/recs";

export type FinalLeaderboardData = {
  player: Entity;
  rank: number;
  finalScore: number;
  wormholeRank?: number;
  shardRank?: number;
};

export function createLeaderboardUtils(components: Components) {
  const getFinalLeaderboardData = (
    playerEntity: Entity,
    alliance: boolean
  ): { allPlayers: FinalLeaderboardData[]; player?: FinalLeaderboardData } => {
    const selfEntity = alliance ? (components.PlayerAlliance.get(playerEntity)?.alliance as Entity) : playerEntity;
    const wormholeData = components.Leaderboard.get(
      alliance ? EntityType.AllianceWormholeLeaderboard : EntityType.PlayerWormholeLeaderboard
    );
    const shardData = components.Leaderboard.get(
      alliance ? EntityType.AllianceShardLeaderboard : EntityType.PlayerShardLeaderboard
    );

    const ret: { allPlayers: FinalLeaderboardData[]; player?: FinalLeaderboardData } = {
      allPlayers: [],
    };
    const playerDatas: Record<Entity, FinalLeaderboardData> = {};

    // inject wormhole data
    wormholeData?.players.forEach((player, index) => {
      const wormholeRank = wormholeData.ranks[index];
      const retData = {
        player,
        wormholeRank,
        finalScore: rankToScore(wormholeRank),
        rank: 0,
      };
      playerDatas[player] = retData;
    });

    // inject shard data
    shardData?.players.forEach((player, index) => {
      const shardRank = shardData.ranks[index];
      const retData = {
        player,
        shardRank,
        finalScore: rankToScore(shardRank) + (playerDatas[player].finalScore ?? 0),
        rank: 0,
      };
      playerDatas[player] = { ...playerDatas[player], ...retData };
    });

    // sort by score
    const sortedPlayerData = Object.values(playerDatas).sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));

    // derive rank from scores
    sortedPlayerData.forEach((playerData, index) => {
      const rank =
        index == 0
          ? 1
          : playerData.finalScore == ret.allPlayers[index - 1]?.finalScore
          ? ret.allPlayers[index - 1].rank
          : index + 1;

      const retData = {
        ...playerData,
        rank,
      };
      ret.allPlayers.push(retData);
      if (playerData.player == selfEntity) ret.player = retData;
    });
    return ret;
  };

  return {
    getFinalLeaderboardData,
  };
}
