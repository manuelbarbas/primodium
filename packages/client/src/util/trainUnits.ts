import { EntityID } from "@latticexyz/recs";
import {
  BuildingType,
  Level,
  P_UnitAttack,
  P_UnitCargo,
  P_UnitDefence,
  P_UnitMining,
  P_UnitProductionTypes,
  P_UnitTravelSpeed,
} from "src/network/components/chainComponents";
import { BlockIdToKey } from "./constants";
import { hashKeyEntity } from "./encode";

export function useTrainableUnits(buildingEntity: EntityID) {
  const buildingType = BuildingType.get(buildingEntity)?.value;
  if (!buildingType) return [];
  const level = Level.use(buildingEntity, { value: 0 }).value;
  console.log("building type:", BlockIdToKey[buildingType]);
  const buildingLevelEntity = hashKeyEntity(buildingType, level);
  console.log("building level:", level);
  console.log("buildingLevelEntity:", buildingLevelEntity);
  return P_UnitProductionTypes.use(buildingLevelEntity, { value: [] })?.value;
}

export function getUnitStats(unitEntity: EntityID) {
  const unitLevelEntity = hashKeyEntity(unitEntity, 1);
  const attack = P_UnitAttack.get(unitLevelEntity, { value: 0 })?.value;
  const defence = P_UnitDefence.get(unitLevelEntity, { value: 0 })?.value;
  const speed = P_UnitTravelSpeed.get(unitLevelEntity, { value: 0 })?.value;
  const mining = P_UnitMining.get(unitLevelEntity, { value: 0 })?.value;
  const cargo = P_UnitCargo.get(unitLevelEntity, { value: 0 })?.value;
  return [
    {
      name: "ATK",
      value: attack,
    },
    {
      name: "DEF",
      value: defence,
    },
    {
      name: "SPD",
      value: speed,
    },
    {
      name: "MIN",
      value: mining,
    },
    {
      name: "CRG",
      value: cargo,
    },
  ];
}

export function checkUtilityReqs() {}

export function checkResourceReqs() {}

export function usePlayerUnitCount() {
  return 0;
}

export function useMaxPlayerUnitCount() {
  return 10;
}
