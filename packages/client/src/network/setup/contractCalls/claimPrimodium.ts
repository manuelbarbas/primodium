import { components } from "@/network/components";
import { SPEED_SCALE } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { execute } from "src/network/txExecute/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";

export const claimPrimodium = async (mud: MUD, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      functionName: "Pri_11__claimPrimodium",
      systemId: getSystemId("ClaimPrimodiumSystem"),
      args: [asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "ClaimPrimodium" as Entity,
    },

    () => makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.EarnPrimodiumOnAsteroid)
  );
};

export const claimShardAsteroid = async (mud: MUD, asteroidEntity: Entity) => {
  const worldSpeed = components.P_GameConfig.get()?.worldSpeed ?? 100n;
  const conquestConfigData = components.P_ConquestConfig.get();
  const shardAsteroid = components.ShardAsteroid.get(asteroidEntity);
  const time = components.Time.get()?.value ?? 0n;
  let explosive = false;
  if (conquestConfigData && shardAsteroid) {
    const lifespan = (conquestConfigData.shardAsteroidLifeSpan * SPEED_SCALE) / worldSpeed;

    const explodeTime = shardAsteroid.spawnTime + lifespan;
    const canExplode = time >= explodeTime;
    const timeUntilExplode = canExplode ? 0n : Number(explodeTime - time);
    if (timeUntilExplode === 0n) {
      explosive = true;
    }
  }
  await execute(
    {
      mud,
      functionName: "Pri_11__claimShardAsteroidPoints",
      systemId: getSystemId("ClaimPrimodiumSystem"),
      args: [asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "ClaimPrimodium" as Entity,
    },
    () => {
      if (explosive) makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.ExplodeVolatileShard);
    }
  );
};
