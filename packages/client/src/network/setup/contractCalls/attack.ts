import { Entity } from "@latticexyz/recs";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const attack = async (mud: MUD, entity: Entity, target: Entity) => {
  await execute(
    {
      mud,
      functionName: "Primodium__attack",
      systemId: getSystemId("CombatSystem"),
      args: [entity as Hex, target as Hex],
      withSession: true,
    },
    {
      id: hashEntities(TransactionQueueType.Attack, entity, target),
      type: TransactionQueueType.Attack,
    }
  );
};
