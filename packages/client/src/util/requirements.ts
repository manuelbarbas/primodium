import { EntityID } from "@latticexyz/recs";
import {
  BuildingCount,
  DefeatedSpawnedPirateAsteroid,
  HasBuiltBuilding,
  HasCompletedObjective,
  HasResearched,
  Level,
  MainBase,
  P_BuildingCountRequirement,
  P_DestroyedUnitsRequirement,
  P_HasBuiltBuilding,
  P_MotherlodeMinedRequirement,
  P_ObjectiveRequirement,
  P_ProductionDependencies,
  P_RaidRequirement,
  P_RequiredPirateAsteroidDefeated,
  P_RequiredResearch,
  P_RequiredResources,
  P_RequiredUtility,
  P_UnitRequirement,
  TotalMotherlodeMined,
  TotalRaid,
  TotalUnitsDestroyed,
} from "src/network/components/chainComponents";
import {
  Account,
  HomeAsteroid,
  Hangar,
} from "src/network/components/clientComponents";
import { hashAndTrimKeyEntity } from "./encode";
import { SingletonID } from "@latticexyz/network";
import {
  getFullResourceCount,
  getRecipe,
  hasEnoughResources,
} from "./resource";
import { RESOURCE_SCALE, RequirementType, ResourceType } from "./constants";

type Requirement = {
  type: RequirementType;
  requirements: {
    id: EntityID;
    requiredValue: number;
    currentValue: number;
    scale: number;
  }[];
  isMet: boolean;
};

export function checkMainBaseLevelRequirement(entityID: EntityID) {
  const player = Account.get()?.value;
  const levelRequirement = Level.get(entityID);
  if (levelRequirement) {
    const mainBase = MainBase.get(player);
    const mainBaselevel = Level.get(mainBase?.value)?.value ?? 1;
    if (mainBaselevel < levelRequirement.value) {
      return false;
    }
  }
  return true;
}

export function checkCompletedObjectiveRequirement(entityID: EntityID) {
  const objectiveRequirement = P_ObjectiveRequirement.get(entityID);
  if (objectiveRequirement) {
    const player = Account.get()?.value ?? SingletonID;
    const hasCompletedObjective = HasCompletedObjective.get(
      hashAndTrimKeyEntity(objectiveRequirement.value, player)
    );
    return hasCompletedObjective?.value ?? false;
  }

  return true;
}

export function checkResearcheRequirement(entityID: EntityID) {
  const requiredResearch = P_RequiredResearch.get(entityID);
  if (requiredResearch) {
    const player = Account.get()?.value ?? SingletonID;
    const hasResearched = HasResearched.get(
      hashAndTrimKeyEntity(requiredResearch.value, player)
    );
    return hasResearched?.value ?? false;
  }

  return true;
}

export function checkProductionRequirement(entityID: EntityID) {
  const requiredProduction = P_ProductionDependencies.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredProduction) {
    for (let i = 0; i < requiredProduction.resources.length; i++) {
      const { production } = getFullResourceCount(
        requiredProduction.resources[i]
      );
      if (production < requiredProduction.values[i]) return false;
    }
  }

  return true;
}

export function checkMaxUtilityResourceReqs(entityID: EntityID) {
  const requiredUtility = P_RequiredUtility.get(entityID, {
    resourceIDs: [],
    requiredAmounts: [],
  });
  if (requiredUtility) {
    for (let i = 0; i < requiredUtility.resourceIDs.length; i++) {
      const { maxStorage } = getFullResourceCount(
        requiredUtility.resourceIDs[i]
      );
      if (maxStorage < requiredUtility.requiredAmounts[i]) return false;
    }
  }

  return true;
}

export function checkHasBuiltBuildingRequirement(entityID: EntityID) {
  const requiredHasBuilt = P_HasBuiltBuilding.get(entityID);

  if (requiredHasBuilt) {
    const player = Account.get()?.value ?? SingletonID;
    const hasBuiltBuilding = HasBuiltBuilding.get(
      hashAndTrimKeyEntity(requiredHasBuilt.value, player)
    );
    return hasBuiltBuilding?.value ?? false;
  }

  return true;
}

export function checkHasDefeatedPirateAsteroid(entityID: EntityID) {
  const requiredDefeatedPirateAsteroid =
    P_RequiredPirateAsteroidDefeated.get(entityID);

  if (requiredDefeatedPirateAsteroid) {
    const player = Account.get()?.value ?? SingletonID;
    const hasDefeatedPirateAsteroid = DefeatedSpawnedPirateAsteroid.get(
      hashAndTrimKeyEntity(requiredDefeatedPirateAsteroid.value, player)
    );
    return hasDefeatedPirateAsteroid?.value ?? false;
  }

  return true;
}

export function checkBuildingCountRequirement(entityID: EntityID) {
  const requiredBildingCounts = P_BuildingCountRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredBildingCounts) {
    const player = Account.get()?.value ?? SingletonID;
    for (let i = 0; i < requiredBildingCounts.values.length; i++) {
      const buildingCount =
        BuildingCount.get(
          hashAndTrimKeyEntity(requiredBildingCounts.resources[i], player)
        )?.value ?? 0;
      if (buildingCount < requiredBildingCounts.values[i]) return false;
    }
  }

  return true;
}

export function checkUnitRequirement(entityID: EntityID) {
  const requiredUnits = P_UnitRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredUnits && requiredUnits.values.length > 0) {
    const player = Account.get()?.value ?? SingletonID;
    const homeAsteroid = HomeAsteroid.get(player)?.value;
    const units = Hangar.get(homeAsteroid);
    if (!units) return false;

    for (let i = 0; i < requiredUnits.values.length; i++) {
      let unitCouunt = 0;
      for (let j = 0; j < units?.units.length; j++) {
        if (units.units[j] == requiredUnits.resources[i])
          unitCouunt = units.counts[j];
      }
      if (unitCouunt < requiredUnits.values[i]) return false;
    }
  }

  return true;
}

export function checkRaidRequirement(entityID: EntityID) {
  const requiredRaid = P_RaidRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredRaid) {
    const player = Account.get()?.value ?? SingletonID;
    for (let i = 0; i < requiredRaid.resources.length; i++) {
      const raidedAmount =
        TotalRaid.get(hashAndTrimKeyEntity(requiredRaid.resources[i], player))
          ?.value ?? 0;
      if (raidedAmount < requiredRaid.values[i]) return false;
    }
  }

  return true;
}

export function checkMotherlodeMinedRequirement(entityID: EntityID) {
  const requiredMotherlodeMined = P_MotherlodeMinedRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredMotherlodeMined) {
    const player = Account.get()?.value ?? SingletonID;
    for (let i = 0; i < requiredMotherlodeMined.resources.length; i++) {
      const minedAmount =
        TotalMotherlodeMined.get(
          hashAndTrimKeyEntity(requiredMotherlodeMined.resources[i], player)
        )?.value ?? 0;
      if (minedAmount < requiredMotherlodeMined.values[i]) return false;
    }
  }

  return true;
}

export function checkDestroyedUnitsRequirement(entityID: EntityID) {
  const requiredDestroyedUnits = P_DestroyedUnitsRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  if (requiredDestroyedUnits) {
    const player = Account.get()?.value ?? SingletonID;
    for (let i = 0; i < requiredDestroyedUnits.resources.length; i++) {
      const destroyedUnitAmount =
        TotalUnitsDestroyed.get(
          hashAndTrimKeyEntity(requiredDestroyedUnits.resources[i], player)
        )?.value ?? 0;
      if (destroyedUnitAmount < requiredDestroyedUnits.values[i]) return false;
    }
  }

  return true;
}

export function getDestroyedUnitsRequirement(
  entityID: EntityID
): Requirement | null {
  if (!P_DestroyedUnitsRequirement.has(entityID)) return null;

  const rawRequiredDestroyedUnits = P_DestroyedUnitsRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  const player = Account.get()?.value ?? SingletonID;
  const requiredDestroyedUnits = rawRequiredDestroyedUnits.resources.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawRequiredDestroyedUnits.values[index],
      currentValue:
        TotalUnitsDestroyed.get(hashAndTrimKeyEntity(resource, player))
          ?.value ?? 0,
      scale: 1,
    })
  );

  return {
    type: RequirementType.DestroyedUnit,
    requirements: requiredDestroyedUnits,
    isMet: checkDestroyedUnitsRequirement(entityID),
  };
}

export function getResourceRequirement(entityID: EntityID): Requirement | null {
  if (!P_RequiredResources.has(entityID)) return null;

  const rawRequiredResources = P_RequiredResources.get(entityID, {
    resources: [],
    values: [],
  });
  const requiredResources = rawRequiredResources.resources.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawRequiredResources.values[index],
      currentValue: getFullResourceCount(resource, ResourceType.Resource)
        .resourceCount,
      scale: RESOURCE_SCALE,
    })
  );

  return {
    type: RequirementType.Resource,
    requirements: requiredResources,
    isMet: hasEnoughResources(getRecipe(entityID)),
  };
}

export function getResourceProductionRequirement(
  entityID: EntityID
): Requirement | null {
  if (!P_ProductionDependencies.has(entityID)) return null;

  const rawRequiredProduction = P_ProductionDependencies.get(entityID, {
    resources: [],
    values: [],
  });
  const requiredProduction = rawRequiredProduction.resources.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawRequiredProduction.values[index],
      currentValue: getFullResourceCount(resource, ResourceType.Resource)
        .production,
      scale: RESOURCE_SCALE,
    })
  );

  return {
    type: RequirementType.ResourceRate,
    requirements: requiredProduction,
    isMet: checkProductionRequirement(entityID),
  };
}

export function getMaxUtilityRequirement(
  entityID: EntityID
): Requirement | null {
  if (!P_RequiredUtility.has(entityID)) return null;

  const rawUtilityRequirement = P_RequiredUtility.get(entityID, {
    resourceIDs: [],
    requiredAmounts: [],
  });
  const requiredMaxUtility = rawUtilityRequirement.resourceIDs.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawUtilityRequirement.requiredAmounts[index],
      currentValue: getFullResourceCount(resource, ResourceType.Utility)
        .maxStorage,
      scale: 1,
    })
  );

  return {
    type: RequirementType.MaxUtility,
    requirements: requiredMaxUtility,
    isMet: checkMaxUtilityResourceReqs(entityID),
  };
}

export function getBuildingCountRequirement(
  entityID: EntityID
): Requirement | null {
  if (!P_BuildingCountRequirement.has(entityID)) return null;

  const rawBuildingCount = P_BuildingCountRequirement.get(entityID, {
    resources: [],
    values: [],
  });
  const player = Account.get()?.value ?? SingletonID;
  const requiredBuildingCount = rawBuildingCount.resources.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawBuildingCount.values[index],
      currentValue:
        BuildingCount.get(hashAndTrimKeyEntity(resource, player))?.value ?? 0,
      scale: 1,
    })
  );

  return {
    type: RequirementType.BuildingCount,
    requirements: requiredBuildingCount,
    isMet: checkBuildingCountRequirement(entityID),
  };
}

export function getUnitRequirement(entityID: EntityID): Requirement | null {
  if (!P_UnitRequirement.has(entityID)) return null;

  const rawUnit = P_UnitRequirement.get(entityID, {
    resources: [],
    values: [],
  });

  const player = Account.get()?.value ?? SingletonID;
  const homeAsteroid = HomeAsteroid.get(player)?.value;
  const units = Hangar.get(homeAsteroid);
  if (!units) {
    const requiredUnit = rawUnit.resources.map((resource, index) => ({
      id: resource,
      requiredValue: rawUnit.values[index],
      currentValue: 0,
      scale: 1,
    }));

    return {
      type: RequirementType.Unit,
      requirements: requiredUnit,
      isMet: checkUnitRequirement(entityID),
    };
  } else {
    const requiredUnit = rawUnit.resources.map((resource, index) => {
      for (let j = 0; j < units?.units.length; j++) {
        if (units.units[j] == resource)
          return {
            id: resource,
            requiredValue: rawUnit.values[index],
            currentValue: units.counts[j],
            scale: 1,
          };
      }
      return {
        id: resource,
        requiredValue: rawUnit.values[index],
        currentValue: 0,
        scale: 1,
      };
    });

    return {
      type: RequirementType.Unit,
      requirements: requiredUnit,
      isMet: checkUnitRequirement(entityID),
    };
  }
}

export function getRaidRequirement(entityID: EntityID): Requirement | null {
  if (!P_RaidRequirement.has(entityID)) return null;

  const rawRaid = P_RaidRequirement.get(entityID, {
    resources: [],
    values: [],
  });

  const player = Account.get()?.value ?? SingletonID;
  const requiredRaid = rawRaid.resources.map((resource, index) => ({
    id: resource,
    requiredValue: rawRaid.values[index],
    currentValue:
      TotalRaid.get(hashAndTrimKeyEntity(resource, player))?.value ?? 0,
    scale: RESOURCE_SCALE,
  }));

  return {
    type: RequirementType.Raid,
    requirements: requiredRaid,
    isMet: checkRaidRequirement(entityID),
  };
}

export function getMotherlodeMinedRequirement(
  entityID: EntityID
): Requirement | null {
  if (!P_MotherlodeMinedRequirement.has(entityID)) return null;

  const rawMotherlodeMined = P_MotherlodeMinedRequirement.get(entityID, {
    resources: [],
    values: [],
  });

  const player = Account.get()?.value ?? SingletonID;
  const requiredMotherlodeMined = rawMotherlodeMined.resources.map(
    (resource, index) => ({
      id: resource,
      requiredValue: rawMotherlodeMined.values[index],
      currentValue:
        TotalMotherlodeMined.get(hashAndTrimKeyEntity(resource, player))
          ?.value ?? 0,
      scale: RESOURCE_SCALE,
    })
  );

  return {
    type: RequirementType.MotherlodeMined,
    requirements: requiredMotherlodeMined,
    isMet: checkMotherlodeMinedRequirement(entityID),
  };
}

export function getResearchRequirement(entityID: EntityID): Requirement | null {
  const rawRequiredResearch = P_RequiredResearch.get(entityID)?.value;

  if (!rawRequiredResearch) return null;

  const player = Account.get()?.value ?? SingletonID;

  return {
    type: RequirementType.HasResearched,
    requirements: [
      {
        id: rawRequiredResearch,
        requiredValue: 1,
        currentValue: HasResearched.get(
          hashAndTrimKeyEntity(rawRequiredResearch, player)
        )
          ? 1
          : 0,
        scale: 1,
      },
    ],
    isMet: checkResearcheRequirement(entityID),
  };
}

export function getHasBuiltBuildingRequirement(
  entityID: EntityID
): Requirement | null {
  const rawRequiredHasBuiltBuilding = P_HasBuiltBuilding.get(entityID)?.value;

  if (!rawRequiredHasBuiltBuilding) return null;

  const player = Account.get()?.value ?? SingletonID;

  return {
    type: RequirementType.HasBuilt,
    requirements: [
      {
        id: rawRequiredHasBuiltBuilding,
        requiredValue: 1,
        currentValue: HasBuiltBuilding.get(
          hashAndTrimKeyEntity(rawRequiredHasBuiltBuilding, player)
        )
          ? 1
          : 0,
        scale: 1,
      },
    ],
    isMet: checkHasBuiltBuildingRequirement(entityID),
  };
}

export function getHasDefeatedPirateRequirement(
  entityID: EntityID
): Requirement | null {
  const rawRequiredHasDefeatedPirate =
    P_RequiredPirateAsteroidDefeated.get(entityID)?.value;

  if (!rawRequiredHasDefeatedPirate) return null;

  const player = Account.get()?.value ?? SingletonID;

  return {
    type: RequirementType.HasDefeatedPirate,
    requirements: [
      {
        id: rawRequiredHasDefeatedPirate,
        requiredValue: 1,
        currentValue: DefeatedSpawnedPirateAsteroid.get(
          hashAndTrimKeyEntity(rawRequiredHasDefeatedPirate, player)
        )
          ? 1
          : 0,
        scale: 1,
      },
    ],
    isMet: checkHasDefeatedPirateAsteroid(entityID),
  };
}

export function getAllRequirements(entityID: EntityID): Requirement[] {
  return [
    getDestroyedUnitsRequirement(entityID),
    getResourceRequirement(entityID),
    getResourceProductionRequirement(entityID),
    getMaxUtilityRequirement(entityID),
    getBuildingCountRequirement(entityID),
    getUnitRequirement(entityID),
    getRaidRequirement(entityID),
    getMotherlodeMinedRequirement(entityID),
    getResearchRequirement(entityID),
    getHasBuiltBuildingRequirement(entityID),
    getHasDefeatedPirateRequirement(entityID),
  ].filter((req) => req !== null) as Requirement[];
}
