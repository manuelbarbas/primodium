import { bigIntMax, bigIntMin } from "@latticexyz/common/utils";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components, components as comps } from "src/network/components";
import { Hex } from "viem";
import { PIRATE_KEY, SPEED_SCALE, UnitStorages } from "./constants";
import { getInGracePeriod } from "./defense";
import { hashKeyEntity } from "./encode";
import { entityToFleetName } from "./name";

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
    if (count == 0n) return;

    const unitData = getUnitStats(unitEntity as Entity, spaceRock);
    ret.attack += unitData.ATK * count;
    ret.defense += unitData.DEF * count;
    ret.hp += unitData.HP * count;
    ret.cargo += unitData.CRG * count;
    ret.decryption = bigIntMax(ret.decryption, unitData.DEC);
    ret.speed = bigIntMin(ret.speed == 0n ? BigInt(10e100) : ret.speed, unitData.SPD);
  });
  return { ...ret, title: entityToFleetName(fleet) };
};

export const getFleetStatsFromUnits = (units: Map<Entity, bigint>) => {
  const selectedRock = components.ActiveRock.get()?.value as Entity;
  const data = { attack: 0n, defense: 0n, speed: 0n, hp: 0n, cargo: 0n, decryption: 0n };

  units.forEach((count, unit) => {
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

export const getOrbitingFleets = (entity: Entity) => {
  const playerEntity = components.Account.get()?.value;
  if (
    !playerEntity ||
    (components.PirateAsteroid.has(entity) &&
      hashKeyEntity(PIRATE_KEY, playerEntity) !== components.OwnedBy.get(entity)?.value)
  )
    return [];

  return [...runQuery([Has(components.IsFleet), HasValue(components.FleetMovement, { destination: entity })])].filter(
    (entity) => {
      const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
      const now = components.Time.get()?.value ?? 0n;
      return arrivalTime < now;
    }
  );
};

export const getFleetTilePosition = (scene: Scene, fleet: Entity) => {
  const { tileHeight, tileWidth } = scene.tilemap;
  const spaceRock = components.FleetMovement.get(fleet)?.destination as Entity;
  const rockGroup = scene.objectPool.getGroup(spaceRock + "_spacerockOrbits");
  const position = rockGroup.get(fleet + "_fleetOrbit", "Graphics").position;
  return { x: position.x / tileWidth, y: -position.y / tileHeight };
};

const orbitRadius = 64;
export function calculatePosition(
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

export function getCanAttackSomeone(entity: Entity) {
  const isFleet = components.IsFleet.get(entity);
  const spaceRock = (isFleet ? components.FleetMovement.get(entity)?.destination : entity) as Entity | undefined;
  if (!spaceRock) return false;
  [spaceRock, ...getOrbitingFleets(spaceRock)].some((target) => getCanAttack(entity, target));
}

export function getCanAttack(originEntity: Entity, targetEntity: Entity) {
  if (originEntity === targetEntity) return false;
  if (getInGracePeriod(targetEntity)) return false;
  const isOriginFleet = components.IsFleet.get(originEntity);
  const isTargetFleet = components.IsFleet.get(targetEntity);
  if (!isOriginFleet && !isTargetFleet) return false;

  const targetRock = (isTargetFleet ? components.FleetMovement.get(targetEntity)?.destination : targetEntity) as
    | Entity
    | undefined;
  const targetOwnerRock = (isTargetFleet ? components.OwnedBy.get(targetEntity)?.value : targetEntity) as
    | Entity
    | undefined;
  const targetRockOwner = components.OwnedBy.get(targetOwnerRock)?.value;

  const originEntityRock = (isOriginFleet ? components.FleetMovement.get(originEntity)?.destination : originEntity) as
    | Entity
    | undefined;
  const originEntityOwnerRock = (isOriginFleet ? components.OwnedBy.get(originEntity)?.value : originEntity) as Entity;
  const originEntityOwnerRockOwner = components.OwnedBy.get(originEntityOwnerRock)?.value;

  if (!originEntityOwnerRockOwner || !targetOwnerRock) return false;
  if (targetRock !== originEntityRock || targetRockOwner === originEntityOwnerRockOwner) return false;
  return true;
}

export function getCanSend(originEntity: Entity, targetEntity: Entity) {
  const isFleet = components.IsFleet.get(targetEntity);

  const currentRock = components.FleetMovement.get(originEntity)?.destination as Entity | undefined;
  if (!currentRock || isFleet || components.BuildingType.has(targetEntity) || currentRock == targetEntity) return false;

  const currentRockIsPirate = components.PirateAsteroid.has(currentRock);
  if (!currentRockIsPirate) return true;

  const player = components.Account.get()?.value;
  const playerHome = components.Home.get(player)?.value;
  return targetEntity == playerHome;
}
