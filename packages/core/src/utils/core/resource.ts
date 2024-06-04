import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EResource, MUDEnums } from "contracts/config/enums";
import { Hex } from "viem";
import { clampBigInt } from "../global/common";
import { ResourceEntityLookup, ResourceEnumLookup, SPEED_SCALE } from "@/constants";
import { Components } from "@/types";

export type ResourceCountData = {
  resourceCount: bigint;
  resourceStorage: bigint;
  production: bigint;
};

export function createResourceUtils(components: Components) {
  function isUtility(resource: Entity) {
    const id = ResourceEnumLookup[resource];
    return components.P_IsUtility.getWithKeys({ id })?.value ?? false;
  }

  const asteroidResources: Map<
    Entity,
    {
      time: bigint;
      resources: Map<Entity, ResourceCountData>;
    }
  > = new Map();

  function getFullResourceCount(resource: Entity, entity: Entity) {
    return (
      getFullResourceCounts(entity).get(resource) ?? {
        resourceCount: 0n,
        resourceStorage: 0n,
        production: 0n,
      }
    );
  }

  function getFleetResourceCount(fleet: Entity) {
    const transportables = components.P_Transportables.get()?.value ?? [];
    return transportables.reduce((acc, resource) => {
      const resourceCount = components.ResourceCount.getWithKeys({ entity: fleet as Hex, resource })?.value ?? 0n;
      if (!resourceCount) return acc;
      acc.set(ResourceEntityLookup[resource as EResource], { resourceStorage: 0n, production: 0n, resourceCount });
      return acc;
    }, new Map() as Map<Entity, ResourceCountData>);
  }

  function getAsteroidResourceCount(asteroid: Entity) {
    const time = components.Time.get()?.value ?? 0n;

    const consumptionTimeLengths: Record<number, bigint> = {};
    const result: Map<Entity, ResourceCountData> = new Map();

    const homeHex = asteroid as Hex;

    const playerLastClaimed = components.LastClaimedAt.getWithKeys({ entity: homeHex })?.value ?? 0n;
    const timeSinceClaimed =
      ((time - playerLastClaimed) * (components.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

    MUDEnums.EResource.forEach((_: string, index: number) => {
      const entity = ResourceEntityLookup[index as EResource];
      if (entity == undefined) return;
      const resource = index as EResource;

      const resourceStorage = components.MaxResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

      const resourceCount = components.ResourceCount.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

      let productionRate = components.ProductionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

      const consumptionRate = components.ConsumptionRate.getWithKeys({ entity: homeHex, resource })?.value ?? 0n;

      if (productionRate == 0n && consumptionRate == 0n)
        return result.set(entity, {
          resourceCount,
          resourceStorage,
          production: 0n,
        });

      let increase = 0n;
      //first we calculate production
      if (productionRate > 0n) {
        const consumedResource = (components.P_ConsumesResource.getWithKeys({ resource })?.value ?? 0) as EResource;

        //check if the consumed resource isn't consumed by the space rock
        const consumedTime = consumptionTimeLengths[consumedResource] ?? 0n;
        //maximum production time is required resource consumption
        const producedTime = consumedResource ? consumedTime : timeSinceClaimed;

        //the amount of resource that has been produced
        increase = productionRate * producedTime;

        //if consumption is less than time passed then production is 0
        if (producedTime < timeSinceClaimed) productionRate = 0n;
      }

      // max resource decrease (if there is enough resource) is decrease < resourceCount + increase
      let decrease = consumptionRate * timeSinceClaimed;

      //max time from the last update to now is max time this resource was consumed
      consumptionTimeLengths[resource] = timeSinceClaimed;

      if (increase == decrease)
        return result.set(entity, {
          resourceCount,
          resourceStorage,
          production: 0n,
        });

      if (decrease - increase > resourceCount) {
        // if the decrease is more than the sum of increase and current amount then the sum is the maximum that can be consumed
        // we use this amount to see how much time the resource can be consumed
        consumptionTimeLengths[resource] = consumptionRate !== 0n ? (resourceCount + increase) / consumptionRate : 0n;
        // we use the time length to reduce current resource amount by the difference of the decrease and the increase
        decrease = consumptionRate * consumptionTimeLengths[resource];
        // consumption is from current space rock and will be in the future
        // consumptionRate = 0n;
      }

      const finalResourceCount = clampBigInt(resourceCount + increase - decrease, 0n, resourceStorage);

      const production =
        finalResourceCount < resourceStorage && finalResourceCount > 0 ? productionRate - consumptionRate : 0n;

      return result.set(entity, {
        resourceCount: finalResourceCount,
        resourceStorage,
        production,
      });
    });

    asteroidResources.set(asteroid, {
      time,
      resources: result,
    });
    return result;
  }

  function getFullResourceCounts(entity: Entity): Map<Entity, ResourceCountData> {
    if (entity === singletonEntity) return new Map();
    return components.IsFleet.get(entity) ? getFleetResourceCount(entity) : getAsteroidResourceCount(entity);
  }

  return {
    isUtility,
    getFullResourceCount,
    getFleetResourceCount,
    getAsteroidResourceCount,
    getFullResourceCounts,
  };
}
