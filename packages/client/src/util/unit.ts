import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity } from "@latticexyz/recs";
import { components, components as comps } from "src/network/components";
import { Hex } from "viem";
import { SPEED_SCALE, UnitStorages } from "./constants";
import { entityToRockName } from "./name";

export function getFleetUnitCounts(fleet: Entity) {
  return components.P_UnitPrototypes.get(undefined, { value: [] }).value.reduce((acc, entity) => {
    const unitCount = components.UnitCount.getWithKeys({
      entity: fleet as Hex,
      unit: entity as Hex,
    })?.value;
    if (!unitCount) return acc;
    acc.set(entity as Entity, unitCount);
    return acc;
  }, new Map() as Map<Entity, bigint>);
}

export function getSpaceRockUnitCounts(spaceRock: Entity) {
  const hangar = components.Hangar.get(spaceRock);
  const map: Map<Entity, bigint> = new Map();
  if (!hangar) return map;
  return hangar.units.reduce((acc, unit, i) => {
    const count = hangar.counts[i];
    acc.set(unit, count);
    return acc;
  }, map);
}

export function getUnitCounts(entity: Entity): Map<Entity, bigint> {
  return components.IsFleet.get(entity) ? getFleetUnitCounts(entity) : getSpaceRockUnitCounts(entity);
}

export function getUnitStats(rawUnitEntity: Entity, spaceRockEntity: Entity) {
  const unitEntity = rawUnitEntity as Hex;

  const unitLevel = comps.UnitLevel.getWithKeys(
    { entity: spaceRockEntity as Hex, unit: unitEntity },
    { value: 0n }
  )?.value;
  const unitLevelKeys = { entity: unitEntity, level: unitLevel };

  const { hp, decryption, attack, defense, speed, cargo } = comps.P_Unit.getWithKeys(unitLevelKeys, {
    attack: 0n,
    defense: 0n,
    speed: 0n,
    cargo: 0n,
    trainingTime: 0n,
    hp: 0n,
    decryption: 0n,
  });
  return {
    ATK: attack,
    DEF: defense,
    SPD: speed,
    CRG: cargo,
    HP: hp,
    DEC: decryption,
  };
}

export const getFleetStats = (fleet: Entity) => {
  const spaceRock = components.OwnedBy.get(fleet)?.value as Entity;
  if (!spaceRock) throw new Error("Fleet must be owned by a space rock");
  const ret = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

  [...UnitStorages].forEach((unit) => {
    const unitEntity = unit as Entity;
    const count = components.UnitCount.getWithKeys(
      { entity: fleet as Hex, unit: unitEntity as Hex },
      { value: 0n }
    )?.value;

    const unitData = getUnitStats(unitEntity as Entity, spaceRock);
    ret.attack += unitData.ATK * count;
    ret.defense += unitData.DEF * count;
    ret.hp += unitData.HP * count;
    ret.cargo += unitData.CRG * count;
    ret.decryption = bigIntMax(ret.decryption, unitData.DEC);
    ret.speed = bigIntMin(ret.speed == 0n ? BigInt(10e100) : ret.speed, unitData.SPD);
  });
  return { ...ret, title: entityToRockName(fleet) };
};

export const getFleetStatsFromUnits = (units: Record<Entity, bigint>) => {
  const selectedRock = components.SelectedRock.get()?.value as Entity;
  const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

  Object.entries(units).forEach(([unit, count]) => {
    const unitData = getUnitStats(unit as Entity, selectedRock);
    data.attack += unitData.ATK * count;
    data.defense += unitData.DEF * count;
    data.hp += unitData.HP * count;
    data.cargo += unitData.CRG * count;
    data.decryption = bigIntMax(data.decryption, unitData.DEC);
    data.speed = bigIntMin(data.speed == 0n ? BigInt(10e100) : data.speed, unitData.SPD);
  });
  return data;
};

// time is in blocks (~1/second)
export function getUnitTrainingTime(rawPlayer: Entity, rawBuilding: Entity, rawUnit: Entity) {
  const player = rawPlayer as Hex;
  const unitEntity = rawUnit as Hex;
  const building = rawBuilding as Hex;

  const config = comps.P_GameConfig.get();
  if (!config) throw new Error("No game config found");
  const unitLevel = comps.UnitLevel.getWithKeys({ entity: player, unit: unitEntity }, { value: 0n })?.value;

  const buildingLevel = comps.Level.get(rawBuilding, { value: 1n }).value;
  const prototype = comps.BuildingType.getWithKeys({ entity: building })?.value as Hex | undefined;
  if (!prototype) throw new Error("No building type found");

  const multiplier = comps.P_UnitProdMultiplier.getWithKeys(
    {
      prototype,
      level: buildingLevel,
    },
    {
      value: 100n,
    }
  ).value;

  const rawTrainingTime = comps.P_Unit.getWithKeys({ entity: unitEntity, level: unitLevel })?.trainingTime ?? 0n;
  return (rawTrainingTime * 100n * 100n * SPEED_SCALE) / (multiplier * config.unitProductionRate * config.worldSpeed);
}
