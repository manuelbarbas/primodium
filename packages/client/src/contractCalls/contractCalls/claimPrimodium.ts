import { EObjectives } from "contracts/config/enums";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { ampli } from "src/ampli";
import { Core, AccountClient, getSystemId, SPEED_SCALE } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Entity } from "@primodiumxyz/reactive-tables";

import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createClaimPointsCalls = (
  { tables }: Core,
  { playerAccount }: AccountClient,
  { execute }: ExecuteFunctions
) => {
  const claimPrimodium = async (asteroidEntity: Entity) => {
    await execute(
      {
        functionName: "Pri_11__claimPrimodium",
        systemId: getSystemId("ClaimPrimodiumSystem"),
        args: [asteroidEntity],
        withSession: true,
      },
      {
        id: "ClaimPrimodium",
      },

      (receipt) => {
        makeObjectiveClaimable(playerAccount.entity, EObjectives.EarnPrimodiumOnAsteroid);

        ampli.systemClaimPrimodiumSystemPrimodiumClaimPrimodium({
          spaceRock: asteroidEntity,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const claimShardAsteroid = async (asteroidEntity: Entity) => {
    const worldSpeed = tables.P_GameConfig.get()?.worldSpeed ?? 100n;
    const conquestConfigData = tables.P_ConquestConfig.get();
    const shardAsteroid = tables.ShardAsteroid.get(asteroidEntity);
    const time = tables.Time.get()?.value ?? 0n;
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
        functionName: "Pri_11__claimShardAsteroidPoints",
        systemId: getSystemId("ClaimPrimodiumSystem"),
        args: [asteroidEntity],
        withSession: true,
      },
      {
        id: "ClaimPrimodium",
      },
      (receipt) => {
        if (explosive) makeObjectiveClaimable(playerAccount.entity, EObjectives.ExplodeVolatileShard);

        ampli.systemClaimPrimodiumSystemPrimodiumClaimShardAsteroidPoints({
          spaceRock: asteroidEntity,
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return {
    claimPrimodium,
    claimShardAsteroid,
  };
};
