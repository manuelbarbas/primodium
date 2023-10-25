import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { getBlockTypeName } from "./common";
import { EntityType, RESOURCE_SCALE, RequirementType, ResourceEntityLookup } from "./constants";
import { getFullResourceCount } from "./resource";

type Requirement = {
  id: Entity;
  requiredValue: bigint;
  currentValue: bigint;
  scale: bigint;
};

export function getMainBaseRequirement(objective: Entity): Requirement[] | undefined {
  const levelRequirement =
    comps.P_RequiredBaseLevel.getWithKeys({ prototype: objective as Hex, level: 1n })?.value ?? 1n;
  if (!levelRequirement) return;

  const player = comps.Account.get()?.value;
  if (!player) return;

  const mainBase = comps.Home.get(player)?.mainBase;
  const level = comps.Level.get(mainBase as Entity)?.value ?? 1n;

  return [
    {
      id: objective as Entity,
      requiredValue: levelRequirement,
      currentValue: level,
      scale: 1n,
    },
  ];
}

export function getObjectivesRequirement(objective: Entity): Requirement[] | undefined {
  const objectives = comps.P_RequiredObjectives.get(objective)?.objectives;
  if (!objectives) return;
  const player = comps.Account.get()?.value;
  if (!player) return;

  return objectives.map((objective) => ({
    id: objective as Entity,
    requiredValue: 1n,
    currentValue: comps.CompletedObjective.getWithKeys({ objective: objective as Hex, entity: player as Hex })?.value
      ? 1n
      : 0n,
    scale: 1n,
  }));
}

export function getExpansionRequirement(objective: Entity): Requirement[] | undefined {
  const requiredExpansion = comps.P_RequiredExpansion.get(objective)?.value;
  if (!requiredExpansion) return;
  const player = comps.Account.get()?.value;
  if (!player) return;
  const playerExpansion = comps.Level.get(player, { value: 0n }).value;

  return [
    {
      id: EntityType.Expansion,
      requiredValue: requiredExpansion,
      currentValue: playerExpansion,
      scale: 1n,
    },
  ];
}

export function getResourceRequirement(objective: Entity): Requirement[] | undefined {
  const rawRequiredProduction = comps.P_ProducedResources.get(objective, {
    resources: [],
    amounts: [],
  });
  if (!rawRequiredProduction) return;
  const player = comps.Account.get()?.value;
  if (!player) return;

  return rawRequiredProduction.resources.map((resource, index) => ({
    id: ResourceEntityLookup[resource as EResource],
    requiredValue: rawRequiredProduction.amounts[index],
    currentValue: getFullResourceCount(ResourceEntityLookup[resource as EResource], player).resourceCount,
    scale: RESOURCE_SCALE,
  }));
}

export function getBuildingCountRequirement(objective: Entity): Requirement[] | undefined {
  const rawRequiredBuildings = comps.P_HasBuiltBuildings.get(objective)?.value;
  if (!rawRequiredBuildings) return;

  const player = comps.Account.get()?.value;
  if (!player) return;

  return rawRequiredBuildings.map((building) => ({
    id: building as Entity,
    requiredValue: 1n,
    currentValue: comps.HasBuiltBuilding.getWithKeys({ buildingType: building as Hex, entity: player as Hex })?.value
      ? 1n
      : 0n,
    scale: 1n,
  }));
}

export function getHasDefeatedPirateRequirement(objective: Entity): Requirement[] | undefined {
  const defeatedPirates = comps.P_DefeatedPirates.get(objective)?.value;

  if (!defeatedPirates) return;

  const player = comps.Account.get()?.value;
  if (!player) return;

  return defeatedPirates.map((pirate) => ({
    id: pirate as Entity,
    requiredValue: 1n,
    currentValue: comps.DefeatedPirate.getWithKeys({ pirate: pirate as Hex, entity: player as Hex })?.value ? 1n : 0n,
    scale: 1n,
  }));
}

export function getRequiredUnitsRequirement(objective: Entity): Requirement[] | undefined {
  const rawRequiredUnits = comps.P_RequiredUnits.get(objective, {
    units: [],
    amounts: [],
  });

  const player = comps.Account.get()?.value;
  if (!player) return;

  const homeAsteroid = comps.Home.get(player)?.asteroid;
  if (!homeAsteroid) return;
  const units = comps.Hangar.get(homeAsteroid as Entity);

  return rawRequiredUnits.units.map((unit, index) => {
    const playerUnitIndex = units?.units.indexOf(unit as Entity);
    let unitCount = 0n;
    if (units && playerUnitIndex !== undefined && playerUnitIndex !== -1) {
      unitCount = units.counts[playerUnitIndex];
    }
    return {
      id: unit as Entity,
      requiredValue: rawRequiredUnits.amounts[index],
      currentValue: unitCount,
      scale: 1n,
    };
  });
}

export function getProducedUnitsRequirement(objective: Entity): Requirement[] | undefined {
  const producedUnits = comps.P_ProducedUnits.get(objective);
  if (!producedUnits) return;

  const player = comps.Account.get()?.value;
  if (!player) return;

  return producedUnits.units.map((unit, index) => ({
    id: unit as Entity,
    requiredValue: producedUnits.amounts[index],
    currentValue: comps.ProducedUnit.getWithKeys({ unit: unit as Hex, entity: player as Hex })?.value ?? 0n,
    scale: 1n,
  }));
}
export function getRaidRequirement(objective: Entity): Requirement[] | undefined {
  const rawRaid = comps.P_RaidedResources.get(objective, {
    resources: [],
    amounts: [],
  });

  const player = comps.Account.get()?.value;
  if (!player) return;

  return rawRaid.resources.map((resource, index) => ({
    id: ResourceEntityLookup[resource as EResource] as Entity,
    requiredValue: rawRaid.amounts[index],
    currentValue: comps.RaidedResource.getWithKeys({ resource, entity: player as Hex })?.value ?? 0n,
    scale: RESOURCE_SCALE,
  }));
}

export function getDestroyedUnitsRequirement(objective: Entity): Requirement[] | undefined {
  const rawRequiredDestroyedUnits = comps.P_DestroyedUnits.get(objective, {
    units: [],
    amounts: [],
  });
  if (!rawRequiredDestroyedUnits) return;

  const player = comps.Account.get()?.value;
  if (!player) return;

  return rawRequiredDestroyedUnits.units.map((unit, index) => ({
    id: unit as Entity,
    requiredValue: rawRequiredDestroyedUnits.amounts[index],
    currentValue: comps.DestroyedUnit.getWithKeys({ unit: unit as Hex, entity: player as Hex })?.value ?? 0n,
    scale: 1n,
  }));
}

export const isRequirementMet = (requirement: Requirement | undefined) =>
  !requirement || requirement.currentValue >= requirement.requiredValue;

export const isAllRequirementsMet = (requirements: Requirement[] | undefined) =>
  !requirements || requirements.every(isRequirementMet);

export function getAllRequirements(objective: Entity): Record<RequirementType, Requirement[]> {
  const requirements = {
    [RequirementType.Expansion]: getExpansionRequirement(objective),
    [RequirementType.ProducedResources]: getResourceRequirement(objective),
    [RequirementType.Buildings]: getBuildingCountRequirement(objective),
    [RequirementType.DefeatedPirates]: getHasDefeatedPirateRequirement(objective),
    [RequirementType.RaidedResources]: getRaidRequirement(objective),
    [RequirementType.RequiredUnits]: getRequiredUnitsRequirement(objective),
    [RequirementType.ProducedUnits]: getProducedUnitsRequirement(objective),
    [RequirementType.DestroyedUnits]: getDestroyedUnitsRequirement(objective),
  };
  console.log("objective:", getBlockTypeName(objective), "requirements:", requirements);
  return Object.fromEntries(Object.entries(requirements).filter(([_, value]) => value !== undefined)) as Record<
    RequirementType,
    Requirement[]
  >;
}

export function getIsObjectiveAvailable(objective: Entity) {
  const requirements = getAllRequirements(objective);
  const mainbaseRequirement = getMainBaseRequirement(objective);
  const objectivesRequirement = getObjectivesRequirement(objective);
  if (Object.keys(requirements).length == 0) return true;
  return isAllRequirementsMet(mainbaseRequirement) && isAllRequirementsMet(objectivesRequirement);
}

export function getCanClaimObjective(objective: Entity) {
  return Object.values(getAllRequirements(objective)).every(isAllRequirementsMet);
}
