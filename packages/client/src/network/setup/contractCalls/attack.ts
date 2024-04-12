import { Entity } from "@latticexyz/recs";
import { EObjectives } from "contracts/config/enums";
import { components } from "src/network/components";
import { execute } from "src/network/txExecute";
import { MUD } from "src/network/types";
import { EntityType, TransactionQueueType } from "src/util/constants";
import { getSystemId, hashEntities } from "src/util/encode";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
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
    },

    () => {
      const homeAsteroid = components.Home.get(mud.playerAccount.entity)?.value as Entity;
      if (!homeAsteroid) return;
      const targetIsFleet = components.IsFleet.has(target);

      const attackerIsFleet = components.IsFleet.has(entity);
      const attackerHasColonyShip =
        components.UnitCount.getWithKeys({ unit: EntityType.ColonyShip as Hex, entity: entity as Hex })?.value ??
        0n > 0n;

      const isDecryptionAttack = attackerIsFleet && attackerHasColonyShip;
      if (isDecryptionAttack) {
        makeObjectiveClaimable(mud.playerAccount.entity, EObjectives.DecryptAttack);
      }
      const objective = targetIsFleet ? EObjectives.BattleFleet : EObjectives.BattleAsteroid;

      makeObjectiveClaimable(mud.playerAccount.entity, objective);
    }
  );
};
