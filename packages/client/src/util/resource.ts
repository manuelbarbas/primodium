import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { EResource, MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hangar } from "src/network/components/clientComponents";
import { Hex } from "viem";
import { EntityType, ResourceEntityLookup, ResourceEnumLookup, ResourceType, SPEED_SCALE } from "./constants";
import { getNow } from "./time";
import { getUnitStats } from "./trainUnits";
import { ERock } from "./web3/types";

// building a building requires resources
// fetch directly from component data
export function getRecipe(rawEntityType: Entity, level: bigint, upgrade = false) {
  const entityType = rawEntityType as Hex;
  const requiredResources = (upgrade ? comps.P_RequiredUpgradeResources : comps.P_RequiredResources).getWithKeys(
    { prototype: entityType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );
  const requiredProduction = comps.P_RequiredDependencies.getWithKeys(
    { prototype: entityType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );

  const resources = requiredResources.resources.map((resource: EResource, index: number) => ({
    id: ResourceEntityLookup[resource],
    type: comps.P_IsUtility.getWithKeys({ id: resource })?.value == true ? ResourceType.Utility : ResourceType.Resource,
    amount: requiredResources.amounts[index],
  }));

  const resourceRate = requiredProduction.resources.map((resource: EResource, index: number) => ({
    id: ResourceEntityLookup[resource],
    type: ResourceType.ResourceRate,
    amount: requiredProduction.amounts[index],
  }));

  return [...resources, ...resourceRate];
}

export const mineableResources = [EntityType.Titanium, EntityType.Iridium, EntityType.Platinum, EntityType.Kimberlite];

export function getMotherlodeResource(entity: Entity) {
  const resource = comps.Motherlode.get(entity)?.motherlodeType as EResource;
  if (!resource || resource > MUDEnums.EResource.length) return MUDEnums.EResource[0] as Entity;
  return ResourceEntityLookup[resource];
}

export function getFullResourceCount(resourceID: Entity, playerEntity: Entity) {
  const query = [
    Has(comps.RockType),
    HasValue(comps.OwnedBy, { value: playerEntity }),
    HasValue(comps.RockType, { value: ERock.Motherlode }),
  ];
  const worldSpeed = comps.P_GameConfig.get()?.worldSpeed ?? 100n;
  const motherlodes = Array.from(runQuery(query));

  let motherlodeProduction = 0n;

  if (mineableResources.includes(resourceID)) {
    motherlodeProduction = motherlodes.reduce((prev: bigint, entity: Entity) => {
      const resource = getMotherlodeResource(entity);

      const hangar = Hangar.get(entity);

      if (!hangar || resource !== resourceID) return prev;

      let total = 0n;
      for (let i = 0; i < hangar.units.length; i++) {
        total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
      }
      return prev + total;
    }, 0n);
  }

  const resourceCount =
    comps.ResourceCount.getWithKeys({ entity: playerEntity as Hex, resource: ResourceEnumLookup[resourceID] })?.value ??
    0n;

  const maxStorage =
    comps.MaxResourceCount.getWithKeys({
      entity: playerEntity as Hex,
      resource: ResourceEnumLookup[resourceID],
    })?.value ?? 0n;

  const buildingProduction =
    comps.ProductionRate.getWithKeys({ entity: playerEntity as Hex, resource: ResourceEnumLookup[resourceID] })
      ?.value ?? 0n;

  const production = (() => {
    return (100n * (buildingProduction + motherlodeProduction)) / worldSpeed;
  })();

  const playerLastClaimed = comps.LastClaimedAt.get(playerEntity)?.value ?? 0n;

  const resourcesToClaimFromBuilding = (() => {
    const toClaim = ((getNow() - playerLastClaimed) * buildingProduction * SPEED_SCALE) / worldSpeed;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  const resourcesToClaim = (() => {
    const toClaim = resourcesToClaimFromBuilding;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  return { resourceCount, resourcesToClaim, maxStorage, production };
}

export function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, playerEntity: Entity, count = 1n) {
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, playerEntity);
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production } = resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        if (resourceCount + resourcesToClaim < resource.amount * count) return false;
        break;
      case ResourceType.ResourceRate:
        if (production < resource.amount * count) return false;
        break;
      case ResourceType.Utility:
        if (resourceCount < resource.amount * count) return false;

        break;
      default:
        return false;
    }
  }

  return true;
}

export function getRecipeDifference(
  firstRecipe: ReturnType<typeof getRecipe>,
  secondRecipe: ReturnType<typeof getRecipe>
) {
  const difference = firstRecipe.map((resource) => {
    let amount = resource.amount;
    if (resource.type == ResourceType.Utility) {
      const secondResource = secondRecipe.find((secondResource) => resource.id === secondResource.id);

      if (secondResource) {
        amount = resource.amount - secondResource.amount;
      }
    }

    return {
      id: resource.id,
      amount: amount,
      type: resource.type,
    };
  });

  return difference;
}
