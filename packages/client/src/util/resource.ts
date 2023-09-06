import { EntityID, EntityIndex, Has, HasValue } from "@latticexyz/recs";
import {
  AsteroidType,
  Item,
  LastClaimedAt,
  Motherlode,
  OccupiedUtilityResource,
  OwnedBy,
  P_MaxStorage,
  P_MotherlodeResource,
  P_RequiredResources,
  P_RequiredUtility,
  Production,
} from "src/network/components/chainComponents";
import { BlockType } from "./constants";
import { hashAndTrimKeyEntity, hashKeyEntity } from "./encode";
import { ResourceType } from "./constants";
import {
  Account,
  BlockNumber,
  Hangar,
} from "src/network/components/clientComponents";
import { useEntityQuery } from "@latticexyz/react";
import { world } from "src/network/world";
import { getUnitStats } from "./trainUnits";
import { ESpaceRockType } from "./web3/types";
import { NewNumberComponent } from "src/network/components/customComponents/Component";

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
  return [...resources, ...utilities];
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
  const { value: blockNumber } = BlockNumber.get(undefined, {
    value: 0,
    avgBlockTime: 1,
  });
  const player = Account.get()?.value;

  const query = [
    Has(AsteroidType),
    HasValue(OwnedBy, { value: player }),
    HasValue(AsteroidType, { value: ESpaceRockType.Motherlode }),
  ];

  const motherlodes = useEntityQuery(query);

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
  const maxStorage = getResourceCount(P_MaxStorage, resourceID);
  const production =
    getResourceCount(Production, resourceID) + motherlodeProduction;
  const lastClaimedAt = getResourceCount(LastClaimedAt, resourceID);

  const resourcesToClaim = (() => {
    const toClaim = (blockNumber - lastClaimedAt) * production;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  })();

  return { resourceCount, resourcesToClaim, maxStorage, production };
}

export function hasEnoughResources(entityId: EntityID) {
  const recipe = getRecipe(entityId);

  const resourcesAmounts = recipe.map((resource) => {
    const { resourceCount, resourcesToClaim } = getFullResourceCount(
      resource.id,
      resource.type
    );

    return resourceCount + resourcesToClaim;
  });

  for (const [index, resource] of recipe.entries()) {
    const resourceAmount = resourcesAmounts[index];

    if (resourceAmount < resource.amount) return false;
  }

  return true;
}
