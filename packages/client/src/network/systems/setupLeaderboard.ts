import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { EScoreType } from "contracts/config/enums";
import { world } from "src/network/world";
import { isPlayer } from "src/util/common";
import { EntityType, LeaderboardEntityLookup } from "src/util/constants";
import { components } from "../components";
import { Leaderboard } from "../components/clientComponents";
import { MUD } from "../types";

export const setupLeaderboard = (mud: MUD) => {
  const leaderboardMaps: Record<Entity, Map<Entity, number>> = {
    [EntityType.PlayerConquestLeaderboard]: new Map<Entity, number>(),
    [EntityType.PlayerExtractionLeaderboard]: new Map<Entity, number>(),
    [EntityType.PlayerGrandLeaderboard]: new Map<Entity, number>(),
    [EntityType.AllianceConquestLeaderboard]: new Map<Entity, number>(),
    [EntityType.AllianceExtractionLeaderboard]: new Map<Entity, number>(),
    [EntityType.AllianceGrandLeaderboard]: new Map<Entity, number>(),
  };
  const systemWorld = namespaceWorld(world, "systems");

  defineComponentSystem(systemWorld, components.Score, ({ entity: rawEntity, value }) => {
    const scoreValue = Number(value[0]?.value ?? 0n);
    const { entity, scoreType } = decodeEntity(components.Score.metadata.keySchema, rawEntity);
    console.log("entity", entity, "scoreType", scoreType, value);

    const entityIsPlayer = isPlayer(entity as Entity);
    const player = mud.playerAccount.entity;
    const playerAlliance = entityIsPlayer ? mud.playerAccount.entity : components.PlayerAlliance.get(player)?.alliance;

    const leaderboardEntity = LeaderboardEntityLookup[entityIsPlayer ? "player" : "alliance"][scoreType as EScoreType];
    const leaderboardMap = leaderboardMaps[leaderboardEntity];

    if (!leaderboardMap) return;

    leaderboardMap.set(entity as Entity, scoreValue);

    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => b[1] - a[1]);

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
