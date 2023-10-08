import { Entity } from "@latticexyz/recs";
import { components as comps } from "src/network/components";
import { Account } from "src/network/components/clientComponents";
import { Hex } from "viem";
import { RESOURCE_SCALE } from "./constants";

export function getUnitStats(rawUnitEntity: Entity) {
  const player = Account.get()?.value as Hex;
  const unitEntity = rawUnitEntity as Hex;
  if (!player) throw new Error("No player account");

  const unitLevel = comps.UnitLevel.getWithKeys({ entity: player, unit: unitEntity }, { value: 0n })?.value;
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
    CRG: cargo * RESOURCE_SCALE,
  };
}

// time is in blocks (~1/second)
export function getUnitTrainingTime(rawPlayer: Entity, rawBuilding: Entity, rawUnit: Entity) {
  const player = rawPlayer as Hex;
  const unitEntity = rawUnit as Hex;
  const building = rawBuilding as Hex;

  const unitLevel = comps.UnitLevel.getWithKeys({ entity: player, unit: unitEntity }, { value: 0n })?.value;

  const buildingLevel = comps.Level.get(rawBuilding, { value: 1n }).value;

  const multiplier =
    comps.P_UnitProdMultiplier.getWithKeys(
      {
        prototype: building,
        level: buildingLevel,
      },
      {
        value: 100n,
      }
    ).value / 100n;
  const time = comps.P_Unit.getWithKeys({ entity: unitEntity, level: unitLevel })?.trainingTime ?? 0n / multiplier;

  return time;
}
