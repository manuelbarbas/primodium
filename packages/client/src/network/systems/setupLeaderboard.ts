import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { EScoreType } from "contracts/config/enums";
import { world } from "src/network/world";
import { isPlayer } from "src/util/common";
import { EntityType, LeaderboardEntityLookup, RESOURCE_SCALE } from "src/util/constants";
import { components } from "../components";
import { Leaderboard } from "../components/clientComponents";
import { MUD } from "../types";

export const setupLeaderboard = (mud: MUD) => {
  const leaderboardMaps: Record<Entity, Map<Entity, bigint>> = {
    [EntityType.PlayerConquestLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.PlayerExtractionLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.PlayerGrandLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceConquestLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceExtractionLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceGrandLeaderboard]: new Map<Entity, bigint>(),
  };
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemWorld, components.Score, ({ entity: rawEntity, value }) => {
    const scoreValue = value[0]?.value ?? 0n;
    const { entity, scoreType } = decodeEntity(components.Score.metadata.keySchema, rawEntity);

    const entityIsPlayer = isPlayer(entity as Entity);
    const player = mud.playerAccount.entity;
    const playerAlliance = entityIsPlayer ? mud.playerAccount.entity : components.PlayerAlliance.get(player)?.alliance;

    const leaderboardEntity = LeaderboardEntityLookup[entityIsPlayer ? "player" : "alliance"][scoreType as EScoreType];
    const leaderboardMap = leaderboardMaps[leaderboardEntity];

    if (!leaderboardMap) return;

    const scale = scoreType === EScoreType.Extraction ? RESOURCE_SCALE : 1n;
    leaderboardMap.set(entity as Entity, scoreValue / scale);

    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => Number(b[1] - a[1]));

    const players = leaderboardArray.map((entry) => entry[0]);
    const scores = leaderboardArray.map((entry) => entry[1]);

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
  });

  return leaderboardMaps;
};
