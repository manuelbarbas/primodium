import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { EScoreType } from "contracts/config/enums";
import { world } from "src/network/world";
import { isPlayer } from "src/util/common";
import { EntityType, LeaderboardEntityLookup, RESOURCE_SCALE } from "src/util/constants";
import { rankToScore } from "src/util/score";
import { components } from "../components";
import { Leaderboard } from "../components/clientComponents";
import { MUD } from "../types";

type Leaderboard = Map<Entity, bigint>;
export const setupLeaderboard = (mud: MUD) => {
  const leaderboardMaps: Record<Entity, Map<Entity, bigint>> = {
    [EntityType.PlayerConquestLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.PlayerExtractionLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceConquestLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceExtractionLeaderboard]: new Map<Entity, bigint>(),
  };
  const systemWorld = namespaceWorld(world, "systems");

  function setGrandLeaderboard(
    inputLeaderboards: { extraction: Leaderboard; conquest: Leaderboard },
    leaderboardEntity: Entity,
    entityIsPlayer: boolean
  ) {
    const grandLeaderboard = new Map<Entity, { score: number; extractionRank: number; conquestRank: number }>();

    Object.entries(inputLeaderboards).forEach(([name, leaderboard]) => {
      const leaderboardArray = [...leaderboard.entries()].sort((a, b) => Number(b[1] - a[1]));
      leaderboardArray.forEach(([entity], index) => {
        const rank = index + 1;
        const score = rankToScore(rank);
        const rankObj =
          name == "extraction"
            ? { conquestRank: grandLeaderboard.get(entity)?.conquestRank ?? 0, extractionRank: rank }
            : {
                extractionRank: grandLeaderboard.get(entity)?.extractionRank ?? 0,
                conquestRank: rank,
              };
        grandLeaderboard.set(entity, { score: (grandLeaderboard.get(entity)?.score ?? 0) + score, ...rankObj });
      });
    });
    const finalLeaderboard = [...grandLeaderboard.entries()].sort((a, b) => Number(b[1].score - a[1].score));
    const data = finalLeaderboard.reduce(
      (acc, [, { score, extractionRank, conquestRank }]) => {
        acc.scores.push(score);
        acc.extractionRanks.push(extractionRank);
        acc.conquestRanks.push(conquestRank);
        return acc;
      },
      {
        scores: [] as number[],
        extractionRanks: [] as number[],
        conquestRanks: [] as number[],
      }
    );

    const playerAlliance = entityIsPlayer
      ? mud.playerAccount.entity
      : components.PlayerAlliance.get(mud.playerAccount.entity)?.alliance;
    components.GrandLeaderboard.set(
      {
        players: finalLeaderboard.map(([entity]) => entity),
        ...data,
        playerRank:
          finalLeaderboard.findIndex(
            ([entity]) => entity == (entityIsPlayer ? mud.playerAccount.entity : playerAlliance)
          ) + 1,
      },
      leaderboardEntity
    );
    return finalLeaderboard;
  }

  function setLeaderboard(leaderboardMap: Map<Entity, bigint>, leaderboardEntity: Entity, entityIsPlayer: boolean) {
    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => Number(b[1] - a[1]));

    const players = leaderboardArray.map((entry) => entry[0]);
    const scores = leaderboardArray.map((entry) => entry[1]);

    const player = mud.playerAccount.entity;
    const playerAlliance = entityIsPlayer ? mud.playerAccount.entity : components.PlayerAlliance.get(player)?.alliance;

    const playerIndex = players.indexOf(entityIsPlayer ? player : (playerAlliance as Entity));
    const playerRank = playerIndex !== -1 ? playerIndex + 1 : leaderboardArray.length + 1;

    Leaderboard.set(
      {
        scores,
        players,
        playerRank,
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

    const scale = scoreType === EScoreType.Extraction ? RESOURCE_SCALE : 1n;
    leaderboardMap.set(entity as Entity, scoreValue / scale);

    setLeaderboard(leaderboardMap, leaderboardEntity, entityIsPlayer);

    entityIsPlayer
      ? setGrandLeaderboard(
          {
            conquest: leaderboardMaps[EntityType.PlayerConquestLeaderboard],
            extraction: leaderboardMaps[EntityType.PlayerExtractionLeaderboard],
          },
          EntityType.PlayerGrandLeaderboard,
          entityIsPlayer
        )
      : setGrandLeaderboard(
          {
            conquest: leaderboardMaps[EntityType.AllianceConquestLeaderboard],
            extraction: leaderboardMaps[EntityType.AllianceExtractionLeaderboard],
          },
          EntityType.AllianceGrandLeaderboard,
          entityIsPlayer
        );
  });

  return leaderboardMaps;
};
