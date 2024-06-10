import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Hex } from "viem";
import { EntityType, UnitStorages } from "@/lib/constants";
import { createDefenseUtils } from "./defense";
import { entityToFleetName } from "../global/name";
import { Tables } from "@/lib/types";

export function createUnitUtils(tables: Tables) {
  const { getInGracePeriod } = createDefenseUtils(tables);
  function getFleetUnitCounts(fleet: Entity) {
    return tables.P_UnitPrototypes.get(undefined, { value: [] }).value.reduce((acc, entity) => {
      const unitCount = tables.UnitCount.getWithKeys({
        entity: fleet as Hex,
        unit: entity as Hex,
      })?.value;
      if (!unitCount) return acc;
      acc.set(entity as Entity, unitCount);
      return acc;
    }, new Map() as Map<Entity, bigint>);
  }

  function getSpaceRockUnitCounts(spaceRock: Entity) {
    const hangar = tables.Hangar.get(spaceRock);
    const map: Map<Entity, bigint> = new Map();
    if (!hangar) return map;
    return hangar.units.reduce((acc, unit, i) => {
      const count = hangar.counts[i];
      acc.set(unit, count);
      return acc;
    }, map);
  }

  function getUnitCounts(entity: Entity): Map<Entity, bigint> {
    return tables.IsFleet.get(entity) ? getFleetUnitCounts(entity) : getSpaceRockUnitCounts(entity);
  }

  function getUnitStatsLevel(entity: Entity, level: bigint) {
    const { hp, attack, defense, speed, cargo } = tables.P_Unit.getWithKeys(
      { entity: entity as Hex, level },
      {
        attack: 0n,
        defense: 0n,
        speed: 0n,
        cargo: 0n,
        trainingTime: 0n,
        hp: 0n,
      }
    );

    const decryption = tables.P_ColonyShipConfig.get()?.decryption ?? 0n;
    return {
      ATK: attack,
      CTR: defense,
      SPD: speed,
      CGO: cargo,
      HP: hp,
      DEC: entity == EntityType.ColonyShip ? decryption : 0n,
    };
  }

  function getUnitStats(unitEntity: Entity, spaceRockEntity: Entity) {
    const unitLevel = tables.UnitLevel.getWithKeys(
      { entity: spaceRockEntity as Hex, unit: unitEntity as Hex },
      { value: 0n }
    )?.value;
    return getUnitStatsLevel(unitEntity, unitLevel);
  }

  const getFleetStats = (fleet: Entity) => {
    const spaceRock = tables.OwnedBy.get(fleet)?.value as Entity;
    if (!spaceRock) throw new Error("Fleet must be owned by a space rock");
    const ret = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

    [...UnitStorages].forEach((unit) => {
      const unitEntity = unit as Entity;

      const count = tables.UnitCount.getWithKeys(
        { entity: fleet as Hex, unit: unitEntity as Hex },
        { value: 0n }
      )?.value;
      if (count == 0n) return;

      const unitData = getUnitStats(unitEntity as Entity, spaceRock);
      ret.attack += unitData.ATK * count;
      ret.defense += unitData.CTR * count;
      ret.hp += unitData.HP * count;
      ret.cargo += unitData.CGO * count;
      ret.speed = bigIntMin(ret.speed == 0n ? BigInt(10e100) : ret.speed, unitData.SPD);
      ret.decryption = unitEntity === EntityType.ColonyShip ? unitData.DEC : ret.decryption;
    });
    return { ...ret, title: entityToFleetName(fleet) };
  };

  const getFleetStatsFromUnits = (units: Map<Entity, bigint>, fleetOwner?: Entity | undefined) => {
    const selectedRock = tables.ActiveRock.get()?.value as Entity;
    const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

    units.forEach((count, unit) => {
      const unitData = getUnitStats(unit as Entity, fleetOwner ?? selectedRock);
      data.attack += unitData.ATK * count;
      data.defense += unitData.CTR * count;
      data.hp += unitData.HP * count;
      data.cargo += unitData.CGO * count;
      data.decryption = bigIntMax(data.decryption, unitData.DEC);
      data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
    });
    return data;
  };

  const getFleets = (entity: Entity): Entity[] => {
    return [...runQuery([Has(tables.IsFleet), HasValue(tables.FleetMovement, { destination: entity })])];
  };

  const isFleetOrbiting = (fleet: Entity) => {
    const arrivalTime = tables.FleetMovement.get(fleet)?.arrivalTime ?? 0n;
    const now = tables.Time.get()?.value ?? 0n;
    return arrivalTime < now;
  };

  const getOrbitingFleets = (entity: Entity) => {
    const playerEntity = tables.Account.get()?.value;
    if (!playerEntity) return [];

    return [...runQuery([Has(tables.IsFleet), HasValue(tables.FleetMovement, { destination: entity })])].filter(
      (entity) => isFleetOrbiting(entity)
    );
  };

  const orbitRadius = 64;
  function calculatePosition(
    angleInDegrees: number,
    origin: { x: number; y: number },
    scale?: { tileWidth: number; tileHeight: number }
  ): { x: number; y: number } {
    const tileWidth = scale?.tileWidth ?? 1;
    const tileHeight = scale?.tileHeight ?? 1;
    const radians = (angleInDegrees * Math.PI) / 180; // Convert angle to radians
    const x = (orbitRadius / tileWidth) * Math.cos(radians); // Calculate x coordinate
    const y = (orbitRadius / tileHeight) * Math.sin(radians); // Calculate y coordinate

    return { x: x + origin.x, y: y + origin.y };
  }

  function getCanAttackSomeone(entity: Entity) {
    const isFleet = tables.IsFleet.get(entity);
    const spaceRock = (isFleet ? tables.FleetMovement.get(entity)?.destination : entity) as Entity | undefined;
    if (!spaceRock) return false;
    return [spaceRock, ...getOrbitingFleets(spaceRock)].some((target) => getCanAttack(entity, target));
  }

  function getCanAttack(originEntity: Entity, targetEntity: Entity) {
    if (originEntity === targetEntity) return false;
    if (getInGracePeriod(targetEntity).inGracePeriod) return false;
    const isOriginFleet = tables.IsFleet.get(originEntity);
    const isTargetFleet = tables.IsFleet.get(targetEntity);
    if (!isOriginFleet && !isTargetFleet) return false;

    const targetRock = (isTargetFleet ? tables.FleetMovement.get(targetEntity)?.destination : targetEntity) as
      | Entity
      | undefined;
    const targetOwnerRock = (isTargetFleet ? tables.OwnedBy.get(targetEntity)?.value : targetEntity) as
      | Entity
      | undefined;
    const targetRockOwner = tables.OwnedBy.get(targetOwnerRock)?.value;

    const originEntityRock = (isOriginFleet ? tables.FleetMovement.get(originEntity)?.destination : originEntity) as
      | Entity
      | undefined;
    const originEntityOwnerRock = (isOriginFleet ? tables.OwnedBy.get(originEntity)?.value : originEntity) as Entity;
    const originEntityOwnerRockOwner = tables.OwnedBy.get(originEntityOwnerRock)?.value;

    if (!originEntityOwnerRockOwner || !targetOwnerRock) return false;
    if (targetRock !== originEntityRock || targetRockOwner === originEntityOwnerRockOwner) return false;
    return true;
  }

  function getCanSend(originEntity: Entity, targetEntity: Entity) {
    const isFleet = tables.IsFleet.get(targetEntity);

    const currentRock = tables.FleetMovement.get(originEntity)?.destination as Entity | undefined;
    if (!currentRock || isFleet || tables.BuildingType.has(targetEntity) || currentRock == targetEntity) return false;

    return true;
  }

  return {
    getUnitCounts,
    getUnitStats,
    getFleetStats,
    getFleetStatsFromUnits,
    getFleets,
    getOrbitingFleets,
    calculatePosition,
    getCanAttack,
    getCanAttackSomeone,
    getCanSend,
  };
}
