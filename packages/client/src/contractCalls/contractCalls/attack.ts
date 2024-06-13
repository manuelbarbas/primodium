import { EObjectives } from "contracts/config/enums";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { ampli } from "src/ampli";
import { AccountClient, Core, getSystemId, EntityType } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { ExecuteFunctions } from "@/contractCalls/txExecute/createExecute";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createAttack =
  ({ tables, utils }: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) =>
  async (entity: Entity, target: Entity) => {
    const targetIsAsteroid = tables.Asteroid.has(target);
    const initialDecryption = targetIsAsteroid
      ? utils.getResourceCount(EntityType.Encryption, target).resourceCount
      : 0n;
    await execute(
      {
        functionName: "Pri_11__attack",
        systemId: getSystemId("CombatSystem"),
        args: [entity, target],
        withSession: true,
      },
      {
        id: `attack-${entity}-${target}`,
      },

      (receipt) => {
        const targetIsFleet = tables.IsFleet.has(target);

        const attackerIsFleet = tables.IsFleet.has(entity);
        const attackerHasColonyShip =
          tables.UnitCount.getWithKeys({ unit: EntityType.ColonyShip, entity: entity })?.value ?? 0n > 0n;

        const isDecryptionAttack = attackerIsFleet && attackerHasColonyShip;
        if (isDecryptionAttack) {
          const finalDecryption = utils.getResourceCount(EntityType.Encryption, target).resourceCount;
          if (finalDecryption < initialDecryption)
            makeObjectiveClaimable(playerAccount.entity, EObjectives.DecryptAttack);
        }
        const objective = targetIsFleet ? EObjectives.BattleFleet : EObjectives.BattleAsteroid;

        makeObjectiveClaimable(playerAccount.entity, objective);

        ampli.systemCombatSystemPrimodiumAttack({
          spaceRock: entity,
          spaceRockTo: target,
          ...parseReceipt(receipt),
        });
      }
    );
  };
