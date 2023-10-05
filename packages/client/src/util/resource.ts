import { Entity, Has, HasValue, Schema, runQuery } from "@latticexyz/recs";
import { MUDEnums } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Account, Hangar } from "src/network/components/clientComponents";
import { ExtendedContractComponent } from "src/network/components/customComponents/ExtendedComponent";
import { Hex } from "viem";
import { BlockType, ResourceType, SPEED_SCALE } from "./constants";
import { getNow } from "./time";
import { getUnitStats } from "./trainUnits";
import { ERock } from "./web3/types";

// building a building requires resources
// fetch directly from component data
export function getRecipe(rawBuildingType: Entity, level: bigint) {
  const buildingType = rawBuildingType as Hex;
  const requiredResources = comps.P_RequiredResources.getWithKeys(
    { prototype: buildingType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );
  const requiredProduction = comps.P_RequiredDependencies.getWithKeys(
    { prototype: buildingType, level: level },
    {
      resources: [],
      amounts: [],
    }
  );

  const resources = requiredResources.resources.map((resource: number, index: number) => ({
    id: MUDEnums.EResource[resource] as Entity,
    type: comps.P_IsUtility.getWithKeys({ id: resource })?.value == true ? ResourceType.Utility : ResourceType.Resource,
    amount: requiredResources.amounts[index],
  }));

  const resourceRate = requiredProduction.resources.map((resource, index) => ({
    id: MUDEnums.EResource[resource] as Entity,
    type: ResourceType.ResourceRate,
    amount: requiredProduction.amounts[index],
  }));

  return [...resources, ...resourceRate];
}

export const mineableResources = [BlockType.Titanium, BlockType.Iridium, BlockType.Platinum, BlockType.Kimberlite];

export function getMotherlodeResource(entity: Entity) {
  const resource = comps.Motherlode.get(entity)?.motherlodeType;
  if (!resource || resource > MUDEnums.EResource.length) return MUDEnums.EResource[0] as Entity;
  return MUDEnums.EResource[resource] as Entity;
}

export default function getResourceCount<S extends Schema>(
  resourceComponent: ExtendedContractComponent<S, { resource: "uint8"; entity: "bytes32" }>,
  resourceId: Entity
) {
  const address = Account.get()?.value;
  if (!address) return 0n;

  const resource = resourceComponent.getWithKeys({
    resource: MUDEnums.EResource.indexOf(resourceId),
    entity: address as Hex,
  });

  if (resource) {
    return BigInt(resource.toString());
  } else {
    return 0n;
  }
}

export function getFullResourceCount(resourceID: Entity) {
  const player = Account.get()?.value;

  const query = [
    Has(comps.RockType),
    HasValue(comps.OwnedBy, { value: player }),
    HasValue(comps.RockType, { value: ERock.Motherlode }),
  ];
  // const worldSpeed = comps.P_WorldSpeed.get()?.value ?? SPEED_SCALE;
  const worldSpeed = 100n;
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

  const resourceCount = getResourceCount(comps.ResourceCount, resourceID);
  const maxStorage = getResourceCount(comps.MaxResourceCount, resourceID);

  const buildingProduction = getResourceCount(comps.ProductionRate, resourceID);

  const production = (() => {
    return buildingProduction + motherlodeProduction;
  })();

  const playerLastClaimed = comps.LastClaimedAt.get(player)?.value ?? 0n;

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

export function hasEnoughResources(recipe: ReturnType<typeof getRecipe>, count = 1n) {
  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id);
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production, maxStorage } = resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        if (resourceCount + resourcesToClaim < resource.amount * count) return false;
        break;
      case ResourceType.ResourceRate:
        if (production < resource.amount * count) return false;
        break;
      case ResourceType.Utility:
        if (maxStorage - (resourceCount + resourcesToClaim) < resource.amount * count) return false;
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
