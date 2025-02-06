import { EPointType } from "contracts/config/enums";

import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";
import { EntityType, LeaderboardEntityLookup } from "@/lib";
import { Core } from "@/lib/types";
import { isPlayer } from "@/utils/global/common";

export const setupLeaderboard = (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const leaderboardMaps: Record<Entity, Map<Entity, bigint>> = {
    [EntityType.PlayerShardLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.PlayerWormholeLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceShardLeaderboard]: new Map<Entity, bigint>(),
    [EntityType.AllianceWormholeLeaderboard]: new Map<Entity, bigint>(),
  };
  const systemWorld = namespaceWorld(world, "coreSystems");

  function setLeaderboard(leaderboardMap: Map<Entity, bigint>, leaderboardEntity: Entity) {
    const leaderboardArray = [...leaderboardMap.entries()].sort((a, b) => Number(b[1] - a[1]));

    const players = leaderboardArray.map((entry) => entry[0]);
    const points = leaderboardArray.map((entry) => entry[1]);
    const ranks: number[] = [];
    points.forEach((point, index) => {
      ranks.push(index == 0 ? 1 : point == points[index - 1] ? ranks[index - 1] : index + 1);
    });

    tables.Leaderboard.set(
      {
        points,
        players,
        ranks,
      },
      leaderboardEntity,
    );
  }

  tables.Points.watch({
    world: systemWorld,
    onChange: ({ entity: rawEntity, properties }) => {
      const pointsValue = properties.current?.value ?? 0n;
      const { entity, pointType } = tables.Points.getEntityKeys(rawEntity);

      const entityIsPlayer = isPlayer(entity as Entity);

      const leaderboardEntity =
        LeaderboardEntityLookup[entityIsPlayer ? "player" : "alliance"][pointType as EPointType];
      const leaderboardMap = leaderboardMaps[leaderboardEntity];

      if (!leaderboardMap) return;

      leaderboardMap.set(entity as Entity, pointsValue);

      setLeaderboard(leaderboardMap, leaderboardEntity);
    },
  });

  return leaderboardMaps;
};
