import { Hex } from "viem";

import { AccountClient, Core, ExecuteFunctions } from "@primodiumxyz/core";
import { Entity, query } from "@primodiumxyz/reactive-tables";
import { ampli } from "@/ampli";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createForfeitCalls = (
  { tables }: Core,
  { playerAccount }: AccountClient,
  { execute, executeBatch }: ExecuteFunctions,
) => {
  const forfeit = async () => {
    const asteroids = query({
      with: [tables.Asteroid],
      withProperties: [{ table: tables.OwnedBy, properties: { value: playerAccount.entity } }],
    });

    const abandonCalls = [...asteroids].map((asteroidEntity: Entity) => ({
      functionName: "Pri_11__abandonAsteroid",
      args: [asteroidEntity],
    })) as {
      functionName: "Pri_11__abandonAsteroid";
      args: [Hex];
    }[];

    await executeBatch({
      systemCalls: abandonCalls,
      withSession: true,
      txQueueOptions: { id: "FORFEIT" as Entity },
      onComplete: (receipt) => {
        ampli.systemAbandonAsteroidSystemPrimodiumAbandonAsteroid({
          spaceRocks: Array.from(asteroids.values()),
          ...parseReceipt(receipt),
        });
      },
    });
  };

  const abandonAsteroid = async (asteroidEntity: Entity) => {
    await execute({
      functionName: "Pri_11__abandonAsteroid",
      args: [asteroidEntity],
      withSession: true,
      txQueueOptions: { id: asteroidEntity },
      onComplete: (receipt) => {
        ampli.systemAbandonAsteroidSystemPrimodiumAbandonAsteroid({
          spaceRocks: [asteroidEntity],
          ...parseReceipt(receipt),
        });
      },
    });
  };

  return {
    forfeit,
    abandonAsteroid,
  };
};
