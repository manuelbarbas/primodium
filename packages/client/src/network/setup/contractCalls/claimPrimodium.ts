import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { Hex } from "viem";

export const claimPrimodium = async (mud: MUD, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__claimPrimodium",
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
  await execute(
    {
      mud,
      functionName: "Primodium__claimShardAsteroidPoints",
      systemId: getSystemId("ClaimPrimodiumSystem"),
      args: [asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "ClaimPrimodium" as Entity,
    },
    () => makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.ExplodeShard)
  );
};
