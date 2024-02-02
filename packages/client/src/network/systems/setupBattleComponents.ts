import { Entity, Has, defineComponentSystem, defineEnterSystem, namespaceWorld } from "@latticexyz/recs";
import { decodeEntity } from "@latticexyz/store-sync/recs";
import { components } from "../components";
import { world } from "../world";

export const setupBattleComponents = () => {
  const systemWorld = namespaceWorld(world, "systems");
  const { RawBattle, RawBattleParticipant, RawBattleParticipants } = components.Battle;

  defineComponentSystem(systemWorld, components.BattleResult, ({ entity, value }) => {
    const battleData = value[0];
    if (!battleData) return RawBattle.remove(entity);
    const data = {
      attacker: battleData.aggressorEntity as Entity,
      attackerDamage: battleData.aggressorDamage,
      defender: battleData.targetEntity as Entity,
      defenderDamage: battleData.targetDamage,
      winner: battleData.winner as Entity,
      rock: battleData.rock as Entity,
      timestamp: battleData.timestamp,
    };

    const oldComponent = RawBattle.get(entity);
    if (!oldComponent) {
      RawBattle.set({ ...data, aggressorAllies: [], targetAllies: [] }, entity);
    } else {
      RawBattle.update(data, entity);
    }
  });

  const updateBattleParticipant = ({ entity }: { entity: Entity }) => {
    const damageDealt = components.BattleDamageDealtResult.get(entity)!.damageDealt;
    const damageTaken = components.BattleDamageTakenResult.get(entity)!;
    const unitResult = components.BattleUnitResult.get(entity)!;
    const raidResult = components.BattleRaidResult.get(entity) ?? {
      resourcesAtStart: undefined,
      resourcesAtEnd: undefined,
    };
    const encryptionResult = components.BattleEncryptionResult.get(entity) ?? {
      encryptionAtStart: undefined,
      encryptionAtEnd: undefined,
    };

    const previousData = RawBattleParticipant.get(entity);

    const newData = { ...previousData, damageDealt, ...damageTaken, ...unitResult, ...raidResult, ...encryptionResult };

    RawBattleParticipant.set(newData, entity);
    const { battleId } = decodeEntity(components.BattleDamageDealtResult.metadata.keySchema, entity);
    const oldParticipantList = RawBattleParticipants.get(battleId as Entity);
    RawBattleParticipants.set({ value: oldParticipantList?.value.concat(entity) ?? [entity] }, battleId as Entity);
  };

  const requiredParticipantQuery = [
    Has(components.BattleDamageDealtResult),
    Has(components.BattleDamageTakenResult),
    Has(components.BattleUnitResult),
  ];
  defineEnterSystem(systemWorld, requiredParticipantQuery, updateBattleParticipant);

  defineComponentSystem(systemWorld, components.BattleRaidResult, updateBattleParticipant);
  defineComponentSystem(systemWorld, components.BattleEncryptionResult, updateBattleParticipant);
};
