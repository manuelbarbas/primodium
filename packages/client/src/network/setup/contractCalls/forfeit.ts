import { components } from "@/network/components";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { execute, executeBatch } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

export const forfeit = async (mud: MUD) => {
  const query = [HasValue(components.OwnedBy, { value: mud.playerAccount.entity }), Has(components.Asteroid)];
  const asteroids = runQuery(query);

  const abandonCalls = [...asteroids].map(
    (asteroidEntity: Entity) =>
      ({
        systemId: getSystemId("AbandonAsteroidSystem"),
        functionName: "Primodium__abandonAsteroid",
        args: [asteroidEntity as Hex],
      } as const)
  );
  console.log({ abandonCalls });

  await executeBatch(
    {
      mud,
      systemCalls: abandonCalls,
    },
    { id: "FORFEIT" as Entity }
  );
};

export const abandonAsteroid = async (mud: MUD, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      systemId: getSystemId("AbandonAsteroidSystem"),
      functionName: "Primodium__abandonAsteroid",
      args: [asteroidEntity as Hex],
    },
    { id: asteroidEntity }
  );
};
