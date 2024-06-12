import { Hex } from "viem";
import { ampli } from "src/ampli";
import { AccountClient, Core, getSystemId } from "@primodiumxyz/core";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { Entity, query } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/util/analytics/parseReceipt";

export const createForfeitCalls = (
  { tables }: Core,
  { playerAccount }: AccountClient,
  { execute, executeBatch }: ExecuteFunctions
) => {
  const forfeit = async () => {
    const asteroids = query({
      with: [tables.Asteroid],
      withProperties: [{ table: tables.OwnedBy, properties: { value: playerAccount.entity } }],
    });

    const abandonCalls = [...asteroids].map((asteroidEntity: Entity) => ({
      systemId: getSystemId("AbandonAsteroidSystem"),
      functionName: "Pri_11__abandonAsteroid",
      args: [asteroidEntity as Hex],
    })) as {
      systemId: Hex;
      functionName: "Pri_11__abandonAsteroid";
      args: [Hex];
    }[];

    await executeBatch(
      {
        systemCalls: abandonCalls,
        withSession: true,
      },
      { id: "FORFEIT" as Entity },
      (receipt) => {
        ampli.systemAbandonAsteroidSystemPrimodiumAbandonAsteroid({
          spaceRocks: Array.from(asteroids.values()),
          ...parseReceipt(receipt),
        });
      }
    );
  };

  const abandonAsteroid = async (asteroidEntity: Entity) => {
    await execute(
      {
        systemId: getSystemId("AbandonAsteroidSystem"),
        functionName: "Pri_11__abandonAsteroid",
        args: [asteroidEntity as Hex],
        withSession: true,
      },
      { id: asteroidEntity },
      (receipt) => {
        ampli.systemAbandonAsteroidSystemPrimodiumAbandonAsteroid({
          spaceRocks: [asteroidEntity as Hex],
          ...parseReceipt(receipt),
        });
      }
    );
  };

  return {
    forfeit,
    abandonAsteroid,
  };
};
