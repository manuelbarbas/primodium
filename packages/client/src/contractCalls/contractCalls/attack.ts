import { EObjectives } from "contracts/config/enums";
import { makeObjectiveClaimable } from "src/util/objectives/makeObjectiveClaimable";
import { ampli } from "src/ampli";
import { AccountClient, Core, EntityType, ExecuteFunctions } from "@primodiumxyz/core";
import { Entity } from "@primodiumxyz/reactive-tables";
import { parseReceipt } from "@/contractCalls/parseReceipt";

export const createAttack =
  (core: Core, { playerAccount }: AccountClient, { execute }: ExecuteFunctions) =>
  async (entity: Entity, target: Entity) => {
    const { tables, utils } = core;
    const targetIsAsteroid = tables.Asteroid.has(target);
    const initialDecryption = targetIsAsteroid
      ? utils.getResourceCount(EntityType.Encryption, target).resourceCount
      : 0n;
    await execute({
      functionName: "Pri_11__attack",

      args: [entity, target],
      withSession: true,
      txQueueOptions: {
        id: `attack-${entity}-${target}`,
      },

      onComplete: (receipt) => {
        const targetIsFleet = tables.IsFleet.has(target);

        const attackerIsFleet = tables.IsFleet.has(entity);
        const attackerHasColonyShip =
          tables.UnitCount.getWithKeys({ unit: EntityType.ColonyShip, entity: entity })?.value ?? 0n > 0n;

        const isDecryptionAttack = attackerIsFleet && attackerHasColonyShip;
        if (isDecryptionAttack) {
          const finalDecryption = utils.getResourceCount(EntityType.Encryption, target).resourceCount;
          if (finalDecryption < initialDecryption)
            makeObjectiveClaimable(core, playerAccount.entity, EObjectives.DecryptAttack);
        }
        const objective = targetIsFleet ? EObjectives.BattleFleet : EObjectives.BattleAsteroid;

        makeObjectiveClaimable(core, playerAccount.entity, objective);

        ampli.systemCombatSystemPrimodiumAttack({
          spaceRock: entity,
          spaceRockTo: target,
          ...parseReceipt(receipt),
        });
      },
    });
  };
