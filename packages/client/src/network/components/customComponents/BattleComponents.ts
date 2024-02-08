import { Entity, Type } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { ResourceEnumLookup, UnitEnumLookup } from "src/util/constants";
import { createExtendedComponent } from "./ExtendedComponent";

export const createBattleComponents = () => {
  const RawBattleParticipants = createExtendedComponent(
    world,
    {
      value: Type.EntityArray,
    },
    { id: "RawBattleParticipants" }
  );

  const RawBattle = createExtendedComponent(
    world,
    {
      attacker: Type.Entity,
      attackerDamage: Type.BigInt,
      defender: Type.Entity,
      defenderDamage: Type.BigInt,
      winner: Type.Entity,
      rock: Type.Entity,
      timestamp: Type.BigInt,
      aggressorAllies: Type.EntityArray,
      targetAllies: Type.EntityArray,
    },
    { id: "RawBattle" }
  );

  const RawBattleParticipant = createExtendedComponent(
    world,
    {
      damageDealt: Type.BigInt,
      damageTaken: Type.BigInt,
      hpAtStart: Type.BigInt,
      unitLevels: Type.BigIntArray,
      unitsAtStart: Type.BigIntArray,
      casualties: Type.BigIntArray,
      resourcesAtStart: Type.OptionalBigIntArray,
      resourcesAtEnd: Type.OptionalBigIntArray,
      encryptionAtStart: Type.OptionalBigInt,
      encryptionAtEnd: Type.OptionalBigInt,
    },
    { id: "RawBattleParticipant" }
  );

  const getParticipant = (participantEntity: Entity) => {
    const participant = RawBattleParticipant.get(participantEntity);
    if (!participant) return;
    const units = Object.entries(UnitEnumLookup).reduce((acc, [entity, index]) => {
      const level = participant.unitLevels[index];
      const unitsAtStart = participant.unitsAtStart[index];
      const casualties = participant.casualties[index];
      acc[entity] = {
        level,
        unitsAtStart,
        casualties,
      };
      return acc;
    }, {} as Record<string, { level: bigint; unitsAtStart: bigint; casualties: bigint }>);

    const resources = Object.entries(ResourceEnumLookup).reduce((acc, [entity, index]) => {
      const resourcesAtStart = participant.resourcesAtStart ? participant.resourcesAtStart[index] : 0n;
      const resourcesAtEnd = participant.resourcesAtEnd ? participant.resourcesAtEnd[index] : 0n;
      acc[entity] = {
        resourcesAtStart,
        resourcesAtEnd,
      };
      return acc;
    }, {} as Record<string, { resourcesAtStart: bigint; resourcesAtEnd: bigint }>);
    return {
      ...participant,
      units,
      resources,
    };
  };

  const get = (battleEntity: Entity) => {
    const battle = RawBattle.get(battleEntity);
    const participants = RawBattleParticipants.get(battleEntity)?.value ?? [];
    if (!battle) return undefined;
    const battleParticipants = participants.reduce((acc, participant) => {
      const data = getParticipant(participant);
      if (!data) return acc;
      acc[participant] = data;
      return acc;
    }, {} as Record<string, ReturnType<typeof getParticipant>>);
    return {
      ...battle,
      participants: battleParticipants,
    };
  };

  const useValue = (battleEntity: Entity) => {
    const rawBattleUpdate = RawBattle.use(battleEntity);
    const rawBattleParticipantsUpdate = RawBattleParticipants.use(battleEntity);
    return useMemo(() => get(battleEntity), [rawBattleUpdate, rawBattleParticipantsUpdate]);
  };

  const getAllPlayerBattles = (player: Entity) => {
    return RawBattle.getAll().reduce((acc, battleEntity) => {
      const battle = get(battleEntity);
      if (!battle) return acc;

      const isAcceptable = !![battle.attacker, battle.defender].find((entity) => {
        const isFleet = components.IsFleet.has(entity);
        const rockEntity = isFleet ? components.OwnedBy.get(entity)?.value : entity;
        return components.OwnedBy.get(rockEntity as Entity)?.value === player;
      });
      if (!isAcceptable) return acc;
      return [...acc, battle];
    }, [] as ReturnType<typeof get>[]);
  };

  const useAllPlayerBattles = (player: Entity) => {
    const rawBattleUpdate = RawBattle.useAll();
    return useMemo(() => getAllPlayerBattles(player), [rawBattleUpdate]);
  };

  return {
    RawBattle,
    RawBattleParticipant,
    RawBattleParticipants,
    getParticipant,
    getAllPlayerBattles,
    useAllPlayerBattles,
    get,
    use: useValue,
  };
};
