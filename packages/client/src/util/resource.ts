import {
  EntityID,
  EntityIndex,
  Has,
  HasValue,
  runQuery,
} from "@latticexyz/recs";
import {
  AsteroidType,
  Item,
  LastClaimedAt,
  MaxUtility,
  Motherlode,
  OccupiedUtilityResource,
  OwnedBy,
  P_MaxStorage,
  P_MotherlodeResource,
  P_ProductionDependencies,
  P_RequiredResources,
  P_RequiredUtility,
  P_WorldSpeed,
  Production,
} from "src/network/components/chainComponents";
import { BlockType, SPEED_SCALE } from "./constants";
import { hashAndTrimKeyEntity, hashKeyEntity } from "./encode";
import { ResourceType } from "./constants";
import {
  Account,
  BlockNumber,
  Hangar,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { getUnitStats } from "./trainUnits";
import { ESpaceRockType } from "./web3/types";
import { NewNumberComponent } from "src/network/components/customComponents/Component";
import { SingletonID } from "@latticexyz/network";

// building a building requires resources
// fetch directly from component data
export function getRecipe(entityId: EntityID) {
  const requiredResources = P_RequiredResources.get(entityId, {
    resources: [],
    values: [],
  });
  const requiredUtilities = P_RequiredUtility.get(entityId, {
    resourceIDs: [],
    requiredAmounts: [],
  });

  const requiredProduction = P_ProductionDependencies.get(entityId, {
    resources: [],
    values: [],
  });

  const resources = requiredResources.resources.map(
    (resourceId: EntityID, index: number) => ({
      id: resourceId,
      type: ResourceType.Resource,
      amount: requiredResources.values[index],
    })
  );

  const utilities = requiredUtilities.resourceIDs.map(
    (resourceId: EntityID, index: number) => ({
      id: resourceId,
      type: ResourceType.Utility,
      amount: requiredUtilities.requiredAmounts[index],
    })
  );

  const resourceRate = requiredProduction.resources.map((resource, index) => ({
    id: resource,
    type: ResourceType.ResourceRate,
    amount: requiredProduction.values[index],
  }));

  return [...resources, ...utilities, ...resourceRate];
}

export const mineableResources = [
  BlockType.Titanium,
  BlockType.Iridium,
  BlockType.Platinum,
  BlockType.Kimberlite,
];

export function getMotherlodeResource(entityID: EntityID) {
  const motherlode = Motherlode.get(entityID);
  if (!motherlode) return;
  const motherlodeType = hashKeyEntity(
    motherlode.motherlodeType,
    motherlode.size
  );
  return P_MotherlodeResource.get(motherlodeType);
}

export default function getResourceCount(
  resourceComponent: NewNumberComponent,
  resourceId: EntityID
) {
  const address = Account.get()?.value;

  let resourceKey: EntityID | undefined = undefined;
  if (address) {
    const encodedEntityId = hashAndTrimKeyEntity(
      resourceId,
      address
    ) as EntityID;
    resourceKey = encodedEntityId.toString().toLowerCase() as EntityID;
  }

  const resource = resourceComponent.get(resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}

export function getFullResourceCount(
  resourceID: EntityID,
  type = ResourceType.Resource
) {
  const blockNumber = BlockNumber.get(undefined, {
    value: 0,
    avgBlockTime: 1,
  }).value;
  const player = Account.get()?.value;

  const query = [
    Has(AsteroidType),
    HasValue(OwnedBy, { value: player }),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];
  const worldSpeed = P_WorldSpeed.get(SingletonID)?.value ?? SPEED_SCALE;
  const motherlodes = Array.from(runQuery(query));

  let motherlodeProduction = 0;

  if (mineableResources.includes(resourceID)) {
    motherlodeProduction = motherlodes.reduce(
      (prev: number, motherlodeIndex: EntityIndex) => {
        const entity = world.entities[motherlodeIndex];
        const resource = getMotherlodeResource(entity);

        const hangar = Hangar.get(entity);

        if (!hangar || resource?.resource !== resourceID) return prev;

        let total = 0;
        for (let i = 0; i < hangar.units.length; i++) {
          total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
        }
        return prev + total;
      },
      0
    );
  }

  const resourceCount = getResourceCount(
    ResourceType.Resource === type ? Item : OccupiedUtilityResource,
    resourceID
  );
  const maxStorage = getResourceCount(
    ResourceType.Resource === type ? P_MaxStorage : MaxUtility,
    resourceID
  );

  const buildingProduction = getResourceCount(Production, resourceID);

  const production = (() => {
    return buildingProduction + motherlodeProduction;
  })();
  const buildingProductionLastClaimedAt = getResourceCount(
    LastClaimedAt,
    resourceID
  );

  const resourcesToClaimFromBuilding = (() => {
    const toClaim =
      ((blockNumber - buildingProductionLastClaimedAt) *
        buildingProduction *
        SPEED_SCALE) /
      worldSpeed;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  const resourcesToClaimFromMotherlode = (() => {
    if (!mineableResources.includes(resourceID)) return 0;
    return motherlodes.reduce((prev: number, motherlodeIndex: EntityIndex) => {
      const entity = world.entities[motherlodeIndex];
      const resource = getMotherlodeResource(entity);

      const hangar = Hangar.get(entity);

      if (!hangar || resource?.resource !== resourceID) return prev;
      const lastClaimedAt = LastClaimedAt.get(entity)?.value ?? 0;

      let total = 0;
      for (let i = 0; i < hangar.units.length; i++) {
        total += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
      }
      return (
        prev +
        total * (((blockNumber - lastClaimedAt) * SPEED_SCALE) / worldSpeed)
      );
    }, 0);
  })();

  const resourcesToClaim = (() => {
    const toClaim =
      resourcesToClaimFromBuilding + resourcesToClaimFromMotherlode;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  return { resourceCount, resourcesToClaim, maxStorage, production };
}

export function hasEnoughResources(entityId: EntityID, count = 1) {
  const recipe = getRecipe(entityId);
  if (!recipe) return true;

  const resourceAmounts = recipe.map((resource) => {
    return getFullResourceCount(resource.id, resource.type);
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourceAmounts[index];
    const { resourceCount, resourcesToClaim, production, maxStorage } =
      resourceAmount;

    switch (resource.type) {
      case ResourceType.Resource:
        if (resourceCount + resourcesToClaim < resource.amount * count)
          return false;
        break;
      case ResourceType.ResourceRate:
        if (production < resource.amount * count) return false;
        break;
      case ResourceType.Utility:
        if (
          maxStorage - (resourceCount + resourcesToClaim) <
          resource.amount * count
        )
          return false;
        break;
      default:
        return false;
    }
  }

  return true;
}
