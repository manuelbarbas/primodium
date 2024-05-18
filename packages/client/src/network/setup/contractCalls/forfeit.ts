import { components } from "@/network/components";
import { execute } from "@/network/txExecute/txExecute";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { executeBatch } from "src/network/txExecute/txExecuteBatch";
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
