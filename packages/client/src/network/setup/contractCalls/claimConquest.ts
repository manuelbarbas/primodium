import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { getSystemId } from "src/util/encode";
import { Hex } from "viem";

export const claimConquest = async (mud: MUD, asteroidEntity: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__claimConquestPoints",
      systemId: getSystemId("ConquestSystem"),
      args: [asteroidEntity as Hex],
      withSession: true,
    },
    {
      id: "Conquest" as Entity,
    }
  );
};
