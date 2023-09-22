import { EntityID } from "@latticexyz/recs";
import {
  BuildingCount,
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
  P_RequiredResearch,
  P_RequiredUtility,
  P_UnitRequirement,
  TotalMotherlodeMined,
  TotalRaid,
  TotalUnitsDestroyed,
} from "src/network/components/chainComponents";
import {
  Account,
  ActiveAsteroid,
  Hangar,
} from "src/network/components/clientComponents";
import { hashAndTrimKeyEntity } from "./encode";
import { SingletonID } from "@latticexyz/network";
import { getFullResourceCount } from "./resource";

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
    const homeAsteroid = ActiveAsteroid.get(player)?.value;
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
