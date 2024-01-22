// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { LibResource } from "libraries/LibResource.sol";
import { UtilityMap } from "libraries/UtilityMap.sol";

import { P_Unit, UnitCount, P_UnitPrototypes, P_Transportables, P_IsRecoverable, Level, IsActive, P_ConsumesResource, ConsumptionRate, Home, P_IsAdvancedResource, ProducedResource, P_RequiredResources, P_IsUtility, ProducedResource, P_RequiredResources, Score, P_ScoreMultiplier, P_IsUtility, P_RequiredResources, P_GameConfig, P_RequiredResourcesData, P_RequiredUpgradeResources, P_RequiredUpgradeResourcesData, P_EnumToPrototype, ResourceCount, MaxResourceCount, UnitLevel, LastClaimedAt, ProductionRate, BuildingType, OwnedBy } from "codegen/index.sol";

import { WORLD_SPEED_SCALE } from "src/constants.sol";

library LibSpaceRockAttributes {
  function getAllUnits(bytes32 spaceRock) internal view returns (uint256[] memory units) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    units = new uint256[](unitPrototypes.length);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      units[i] = UnitCount.get(spaceRock, unitPrototypes[i]);
    }
    return units;
  }

  function getDefense(bytes32 spaceRock) internal view returns (uint256 defense) {
    defense = ResourceCount.get(spaceRock, uint8(EResource.U_Defense));
    uint256 hp = ResourceCount.get(spaceRock, uint8(EResource.R_HP));
    uint256 maxHp = MaxResourceCount.get(spaceRock, uint8(EResource.R_HP));
    defense = (defense * hp) / maxHp;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      uint256 unitLevel = UnitLevel.get(spaceRock, unitPrototypes[i]);
      defense += P_Unit.getDefense(unitPrototypes[i], unitLevel) * unitCount;
    }
    defense = (defense * (100 + ResourceCount.get(spaceRock, uint8(EResource.M_DefenseMultiplier)))) / 100;
  }

  function getDefensesWithDefenders(bytes32 spaceRock)
    internal
    view
    returns (uint256[] memory defenses, uint256 totalDefense)
  {
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    defenses = new uint256[](defenderFleetIds.length + 1);
    defenses[0] = getDefense(spaceRock);
    totalDefense += defenses[0];
    for (uint8 i = 0; i < defenderFleetIds.length; i++) {
      defenses[i + 1] = LibFleetAttributes.getDefense(defenderFleetIds[i]);
      totalDefense += defenses[i + 1];
    }
  }

  function getDefenseWithDefenders(bytes32 spaceRock) internal view returns (uint256 defense) {
    defense = getDefense(spaceRock);
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    for (uint8 i = 0; i < defenderFleetIds.length; i++) {
      defense += LibFleetAttributes.getDefense(defenderFleetIds[i]);
    }
  }

  function getHp(bytes32 spaceRock) internal view returns (uint256 hp) {
    hp = ResourceCount.get(spaceRock, uint8(EResource.R_HP));
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      uint256 unitLevel = UnitLevel.get(spaceRock, unitPrototypes[i]);
      hp += P_Unit.getHp(unitPrototypes[i], unitLevel) * unitCount;
    }
  }

  function getHpWithDefenders(bytes32 spaceRock) internal view returns (uint256[] memory hps, uint256 totalHp) {
    totalHp = getHp(spaceRock);
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    hps = new uint256[](defenderFleetIds.length + 1);
    hps[0] = totalHp;
    for (uint8 i = 0; i < defenderFleetIds.length; i++) {
      hps[i + 1] = LibFleetAttributes.getHp(defenderFleetIds[i]);
      totalHp += hps[i + 1];
    }
  }

  function getCargo(bytes32 spaceRock) internal view returns (uint256 cargo) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      uint256 unitLevel = UnitLevel.get(spaceRock, unitPrototypes[i]);
      cargo += P_Unit.getCargo(unitPrototypes[i], unitLevel) * unitCount;
    }
  }

  function getEncryption(bytes32 spaceRock) internal view returns (uint256 encryption) {
    encryption = ResourceCount.get(spaceRock, uint8(EResource.R_Encryption));
  }

  function getStoredResourceCountWithDefenders(bytes32 spaceRock) internal view returns (uint256 totalResources) {
    totalResources = LibResource.getStoredResourceCountVaulted(spaceRock);
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    for (uint256 i = 0; i < defenderFleetIds.length; i++) {
      totalResources += LibFleetAttributes.getOccupiedCargo(defenderFleetIds[i]);
    }
  }

  function getStoredResourceCountsWithDefenders(bytes32 spaceRock) internal view returns (uint256[] memory, uint256) {
    (uint256[] memory resourceCounts, uint256 totalResources) = LibResource.getStoredResourceCountsVaulted(spaceRock);
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    for (uint256 i = 0; i < defenderFleetIds.length; i++) {
      uint256[] memory defenderResourceCounts = LibFleetAttributes.getResourceCounts(defenderFleetIds[i]);
      for (uint256 j = 0; j < defenderResourceCounts.length; j++) {
        resourceCounts[j] += defenderResourceCounts[j];
        totalResources += defenderResourceCounts[j];
      }
    }
    return (resourceCounts, totalResources);
  }

  function getFreeCargoSpaceWithDefenders(bytes32 spaceRock) internal view returns (uint256 totalCargo) {
    totalCargo = getCargo(spaceRock);
    bytes32[] memory defenderFleetIds = LibFleetStance.getDefendingFleets(spaceRock);
    for (uint256 i = 0; i < defenderFleetIds.length; i++) {
      totalCargo += LibFleetAttributes.getFreeCargoSpace(defenderFleetIds[i]);
    }
  }

  function getFreeCargoSpacesWithDefenders(bytes32 fleetId)
    internal
    view
    returns (uint256[] memory freeCargoSpaces, uint256 totalFreeCargoSpace)
  {
    bytes32[] memory followerFleetIds = LibFleetStance.getFollowerFleets(fleetId);
    freeCargoSpaces = new uint256[](followerFleetIds.length + 1);
    freeCargoSpaces[0] = getCargo(fleetId);
    totalFreeCargoSpace = freeCargoSpaces[0];

    for (uint8 i = 0; i < followerFleetIds.length; i++) {
      freeCargoSpaces[i + 1] = LibFleetAttributes.getFreeCargoSpace(followerFleetIds[i]);
      totalFreeCargoSpace += freeCargoSpaces[i + 1];
    }
  }
}
