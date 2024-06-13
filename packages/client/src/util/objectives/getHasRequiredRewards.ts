import { Entity } from "@primodiumxyz/reactive-tables";
import { EResource } from "contracts/config/enums";
import { Hex } from "viem";
import { ObjectiveReq } from "./types";
import { Core, getEntityTypeName, ResourceEntityLookup, ResourceType, UtilityStorages } from "@primodiumxyz/core";
import { EntityToResourceImage } from "@/util/image";

export function getRewardUtilitiesRequirement(core: Core, objective: Entity, asteroid: Entity): ObjectiveReq[] {
  const { tables, utils } = core;
  const rewards = getRewards(core, objective);
  const requiredUtilities = rewards.reduce((acc, cur) => {
    if (cur.type !== ResourceType.Utility) return acc;
    const prototype = cur.id as Hex;
    const level = tables.UnitLevel.getWithKeys({ unit: prototype, entity: asteroid as Hex })?.value ?? 0n;
    const requiredResources = tables.P_RequiredResources.getWithKeys({ prototype, level });
    if (!requiredResources) return acc;
    requiredResources.resources.forEach((rawResource, i) => {
      const resource = ResourceEntityLookup[rawResource as EResource];
      const amount = requiredResources.amounts[i] * cur.amount;
      if (!UtilityStorages.has(resource)) return;
      acc[resource] ? (acc[resource] += amount) : (acc[resource] = amount);
    });
    return acc;
  }, {} as Record<Entity, bigint>);

  return Object.entries(requiredUtilities).map(([entity, requiredValue]) => {
    const { resourceCount, resourceStorage } = utils.getResourceCount(entity as Entity, asteroid);
    const val = requiredValue + (resourceStorage - resourceCount);
    return {
      entity: entity as Entity,
      requiredValue: val,
      currentValue: resourceStorage,
      scale: 1n,
      backgroundImage: EntityToResourceImage[entity as Entity],
      tooltipText: `${getEntityTypeName(entity as Entity)}`,
    };
  });
}

export function getHasRequiredRewards(core: Core, asteroidEntity: Entity, objectiveEntity: Entity) {
  const { utils } = core;
  const rewards = getRewards(core, objectiveEntity);
  return rewards.every((resource) => {
    if (resource.type !== ResourceType.Resource) return true;
    const { resourceCount, resourceStorage } = utils.getResourceCount(resource.id, asteroidEntity);
    return resourceCount + resource.amount < resourceStorage;
  });
}

export function getRewards({ tables }: Core, entityId: Entity) {
  const rawResourceRewards = tables.P_ResourceReward.get(entityId, {
    resources: [],
    amounts: [],
  });

  const rawUnitRewards = tables.P_UnitReward.get(entityId, {
    units: [],
    amounts: [],
  });

  const resourceRewards = rawResourceRewards.resources.map((resource, index) => ({
    id: ResourceEntityLookup[resource as EResource],
    type: ResourceType.Resource,
    amount: rawResourceRewards.amounts[index],
  }));

  const unitRewards = rawUnitRewards.units.map((unit, index) => ({
    id: unit as Entity,
    type: ResourceType.Utility,
    amount: rawUnitRewards.amounts[index],
  }));

  return [...resourceRewards, ...unitRewards];
}
