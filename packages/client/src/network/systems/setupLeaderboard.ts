import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { EScoreType } from "contracts/config/enums";
import { world } from "src/network/world";
import { isPlayer } from "src/util/common";
import { EntityType, LeaderboardEntityLookup } from "src/util/constants";
import { components } from "../components";

export const setupLeaderboard = () => {
  const leaderboardMaps: Record<Entity, Map<Entity, bigint>> = {
    [EntityType.PlayerShardLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.PlayerWormholeLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceShardLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceWormholeLeaderboard]: new Map<Entity, bigint>(),
  };
  const systemWorld = namespaceWorld(world, "systems");

  function setLeaderboard(leaderboardMap: Map<Entity, bigint>, leaderboardEntity: Entity) {
    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => Number(b[1] - a[1]));

    const players = leaderboardArray.map((entry) => entry[0]);
    const scores = leaderboardArray.map((entry) => entry[1]);
    const ranks: number[] = [];
    scores.forEach((score, index) => {
      ranks.push(index == 0 ? 1 : score == scores[index - 1] ? ranks[index - 1] : index + 1);
    });

    components.Leaderboard.set(
      {
        scores,
        players,
        ranks,
      },
      leaderboardEntity
    );
  }

  defineComponentSystem(systemWorld, components.Score, ({ entity: rawEntity, value }) => {
    const scoreValue = value[0]?.value ?? 0n;
    const { entity, scoreType } = decodeEntity(components.Score.metadata.keySchema, rawEntity);

    const entityIsPlayer = isPlayer(entity as Entity);

    const leaderboardEntity = LeaderboardEntityLookup[entityIsPlayer ? "player" : "alliance"][scoreType as EScoreType];
    const leaderboardMap = leaderboardMaps[leaderboardEntity];

    if (!leaderboardMap) return;

    leaderboardMap.set(entity as Entity, scoreValue);

    setLeaderboard(leaderboardMap, leaderboardEntity);
  });

  return leaderboardMaps;
};
