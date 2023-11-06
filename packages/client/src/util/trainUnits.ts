import { Entity } from "@latticexyz/recs";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { RESOURCE_SCALE, SPEED_SCALE } from "./constants";

export function getUnitStats(rawUnitEntity: Entity, playerEntity: Entity) {
  const unitEntity = rawUnitEntity as Hex;

  const unitLevel = comps.UnitLevel.getWithKeys(
    { entity: playerEntity as Hex, unit: unitEntity },
    { value: 0n }
  )?.value;
  const unitLevelKeys = { entity: unitEntity, level: unitLevel };

  const { attack, defense, speed, cargo } = comps.P_Unit.getWithKeys(unitLevelKeys, {
    attack: 0n,
    defense: 0n,
    speed: 0n,
    cargo: 0n,
    trainingTime: 0n,
  });
  const mining = comps.P_MiningRate.getWithKeys(unitLevelKeys, { value: 0n }).value;
  return {
    ATK: attack,
    DEF: defense,
    SPD: speed,
    MIN: mining,
    CRG: cargo / RESOURCE_SCALE,
  };
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
