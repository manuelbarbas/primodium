// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
// tables
import { P_Defense, TotalDefense, P_DefenseMultiplier, TotalDefenseMultiplier, P_Vault, TotalVault, HasBuiltBuilding, P_UnitProdTypes, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";

// types
import { BuildingKey, BuildingTileKey, ExpansionKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource } from "src/Types.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

library LibDefense {
  function upgradeBuildingDefenses(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    increasePlayerDefense(playerEntity, buildingType, level);
    increasePlayerDefenseMultiplier(playerEntity, buildingType, level);
    increasePlayerVault(playerEntity, buildingType, level);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingEntity Entity ID of the building which is increasing the defense
  function clearBuildingDefenses(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingType = BuildingType.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    clearPlayerDefense(playerEntity, buildingType, level);
    clearPlayerDefenseMultiplier(playerEntity, buildingType, level);
    clearPlayerVault(playerEntity, buildingType, level);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is increasing the defense
  /// @param level the level of the building for which the defense is increased
  function increasePlayerDefense(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint256 defenseIncrease = P_Defense.get(buildingType, level);
    if (level > 1) {
      defenseIncrease -= P_Defense.get(buildingType, level - 1);
    }
    TotalDefense.set(playerEntity, TotalDefense.get(playerEntity) + defenseIncrease);
    uint256 defenseMultiplierIncrease = P_DefenseMultiplier.get(buildingType, level);
    if (level > 1) {
      defenseMultiplierIncrease -= P_DefenseMultiplier.get(buildingType, level - 1);
    }
    TotalDefenseMultiplier.set(playerEntity, TotalDefenseMultiplier.get(playerEntity) + defenseMultiplierIncrease);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is clearing the defense
  /// @param level the level of the building for which the defense is cleared
  function clearPlayerDefense(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint256 defenseIncrease = P_Defense.get(buildingType, level);
    if (defenseIncrease > 0) TotalDefense.set(playerEntity, TotalDefense.get(playerEntity) - defenseIncrease);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is increasing the defense
  /// @param level the level of the building for which the defense is increased
  function increasePlayerDefenseMultiplier(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint256 defenseMultiplierIncrease = P_DefenseMultiplier.get(buildingType, level);
    if (level > 1) {
      defenseMultiplierIncrease -= P_DefenseMultiplier.get(buildingType, level - 1);
    }
    TotalDefenseMultiplier.set(playerEntity, TotalDefenseMultiplier.get(playerEntity) + defenseMultiplierIncrease);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is clearing the defense
  /// @param level the level of the building for which the defense is cleared
  function clearPlayerDefenseMultiplier(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint256 defenseMultiplierIncrease = P_DefenseMultiplier.get(buildingType, level);
    if (defenseMultiplierIncrease > 0)
      TotalDefenseMultiplier.set(playerEntity, TotalDefenseMultiplier.get(playerEntity) - defenseMultiplierIncrease);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is increasing the defense
  /// @param level the level of the building for which the defense is increased
  function increasePlayerVault(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    uint8[] memory vaultResources = P_Vault.getResources(buildingType, level);
    uint256[] memory vaultAmounts = P_Vault.getAmounts(buildingType, level);
    for (uint256 i = 0; i < vaultResources.length; i++) {
      uint8 resource = vaultResources[i];
      uint256 vaultIncrease = vaultAmounts[i];
      if (level > 1 && P_Vault.lengthAmounts(buildingType, level - 1) > i) {
        vaultIncrease -= P_Vault.getAmounts(buildingType, level - 1)[i];
      }
      TotalVault.set(playerEntity, resource, TotalVault.get(playerEntity, resource) + vaultIncrease);
    }
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingType Entity ID of the building which is clearing the defense
  /// @param level the level of the building for which the defense is cleared
  function clearPlayerVault(
    bytes32 playerEntity,
    bytes32 buildingType,
    uint256 level
  ) internal {
    if (P_Vault.lengthResources(buildingType, level) > 0) {
      uint8[] memory vaultResources = P_Vault.getResources(buildingType, level);
      uint256[] memory vaultAmounts = P_Vault.getAmounts(buildingType, level);
      for (uint256 i = 0; i < vaultResources.length; i++) {
        uint8 resource = vaultResources[i];
        uint256 vaultIncrease = vaultAmounts[i];
        TotalVault.set(playerEntity, resource, TotalVault.get(playerEntity, resource) - vaultIncrease);
      }
    }
  }
}
