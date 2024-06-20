import { Core } from "@/lib/types";
import { Entity, namespaceWorld } from "@primodiumxyz/reactive-tables";

function isZeroHex(value: string): boolean {
  return /^0x0+$/i.test(value);
}
export const setupBattleComponents = (core: Core) => {
  const {
    network: { world },
    tables,
  } = core;

  const systemWorld = namespaceWorld(world, "coreSystems");
  const { RawBattle, RawBattleParticipant, RawBattleParticipants } = tables.Battle;

  tables.BattleResult.watch({
    world: systemWorld,
    onChange: ({ entity, properties }) => {
      const battleData = properties.current;
      if (!battleData) return RawBattle.remove(entity);

      const data = {
        attacker: battleData.aggressorEntity as Entity,
        attackerDamage: battleData.aggressorDamage,
        defender: battleData.targetEntity as Entity,
        defenderDamage: battleData.targetDamage,
        attackingPlayer: battleData.playerEntity as Entity,
        defendingPlayer: isZeroHex(battleData.targetPlayerEntity)
          ? undefined
          : (battleData.targetPlayerEntity as Entity),
        winner: battleData.winnerEntity as Entity,
        rock: battleData.asteroidEntity as Entity,
        timestamp: battleData.timestamp,
        aggressorAllies: battleData.aggressorAllies as Entity[],
        targetAllies: battleData.targetAllies as Entity[],
      };

      RawBattle.set(data, entity);
    },
  });

  const updateBattleParticipant = ({ entity }: { entity: Entity }) => {
    const { battleEntity } = tables.BattleDamageDealtResult.getEntityKeys(entity);
    const damageDealt = tables.BattleDamageDealtResult.get(entity)?.damageDealt ?? 0n;
    const { hpAtStart, damageTaken } = tables.BattleDamageTakenResult.get(entity) ?? {
      hpAtStart: 0n,
      damageTaken: 0n,
    };
    const { unitLevels, casualties, unitsAtStart } = tables.BattleUnitResult.get(entity) ?? {
      unitLevels: undefined,
      casualties: undefined,
      unitsAtStart: undefined,
    };
    const { resourcesAtStart, resourcesAtEnd } = tables.BattleRaidResult.get(entity) ?? {
      resourcesAtStart: undefined,
      resourcesAtEnd: undefined,
    };
    const { encryptionAtStart, encryptionAtEnd } = tables.BattleEncryptionResult.get(entity) ?? {
      encryptionAtStart: undefined,
      encryptionAtEnd: undefined,
    };

    const previousData = RawBattleParticipant.get(entity);

    const newData = {
      ...previousData,
      damageDealt,
      hpAtStart,
      damageTaken,
      unitLevels,
      unitsAtStart,
      casualties,
      resourcesAtStart,
      resourcesAtEnd,
      encryptionAtStart,
      encryptionAtEnd,
    };

    RawBattleParticipant.set(newData, entity);
    const oldParticipantList = RawBattleParticipants.get(battleEntity as Entity)?.value;
    if (oldParticipantList?.includes(entity)) return;
    RawBattleParticipants.set({ value: oldParticipantList?.concat(entity) ?? [entity] }, battleEntity as Entity);
  };

  tables.BattleDamageDealtResult.watch({
    world: systemWorld,
    onEnter: updateBattleParticipant,
  });

  tables.BattleDamageTakenResult.watch({
    world: systemWorld,
    onEnter: updateBattleParticipant,
  });

  tables.BattleUnitResult.watch({
    world: systemWorld,
    onEnter: updateBattleParticipant,
  });
  tables.BattleRaidResult.watch({
    world: systemWorld,
    onEnter: updateBattleParticipant,
  });
  tables.BattleEncryptionResult.watch({
    world: systemWorld,
    onEnter: updateBattleParticipant,
  });
};
