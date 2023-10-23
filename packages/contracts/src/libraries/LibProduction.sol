// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceCount, BuildingType, Level, P_Production, P_ProductionData, P_IsUtility, ProductionRate } from "codegen/index.sol";
import { EResource } from "src/Types.sol";
import { LibStorage } from "libraries/LibStorage.sol";

library LibProduction {
  /// @notice Upgrades the resource production of a building
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingEntity Entity ID of the building to upgrade
  /// @param targetLevel Level to which the building is upgraded
  function upgradeResourceProduction(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 targetLevel
  ) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, targetLevel);
    if (prototypeProduction.amount == 0) return;
    uint8 resource = prototypeProduction.resource;
    uint256 prevLevelPrototypeProduction = targetLevel > 1
      ? P_Production.get(buildingPrototype, targetLevel - 1).amount
      : 0;
    uint256 addedProductionRate = prototypeProduction.amount - prevLevelPrototypeProduction;

    increaseResourceProduction(playerEntity, EResource(resource), addedProductionRate);
  }

  /// @notice increases the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param resource the resource the production is increased for
  /// @param amount the amount the production is increased by
  function increaseResourceProduction(
    bytes32 playerEntity,
    EResource resource,
    uint256 amount
  ) internal {
    uint8 resourceIndex = uint8(resource);
    if (P_IsUtility.get(resourceIndex)) {
      LibStorage.increaseMaxUtility(playerEntity, resourceIndex, amount);
      LibStorage.increaseStoredResource(playerEntity, resourceIndex, amount);
      return;
    }
    uint256 prevProductionRate = ProductionRate.get(playerEntity, resourceIndex);
    ProductionRate.set(playerEntity, resourceIndex, prevProductionRate + amount);
  }

  /// @notice Clears the resource production of a building, used when the building is destroyed
  /// @param playerEntity Entity ID of the player owning the building
  /// @param buildingEntity Entity ID of the building to clear
  function clearResourceProduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint256 buildingLevel = Level.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, buildingLevel);
    if (prototypeProduction.amount == 0) return;
    uint8 resource = prototypeProduction.resource;
    decreaseResourceProduction(playerEntity, EResource(resource), prototypeProduction.amount);
  }

  /// @notice Reduces the resource production for the player
  /// @param playerEntity Entity ID of the player owning the building
  /// @param resource the resource the production is reduced for
  /// @param amount the amount the production is reduced by
  function decreaseResourceProduction(
    bytes32 playerEntity,
    EResource resource,
    uint256 amount
  ) internal {
    uint8 resourceIndex = uint8(resource);
    if (P_IsUtility.get(resourceIndex)) {
      uint256 availableUtility = ResourceCount.get(playerEntity, resourceIndex);
      require(availableUtility >= amount, "[UtilityUsage] not enough available utility production");
      LibStorage.decreaseStoredResource(playerEntity, resourceIndex, amount);
      LibStorage.decreaseMaxUtility(playerEntity, resourceIndex, amount);
      return;
    }
    uint256 prevProductionRate = ProductionRate.get(playerEntity, resourceIndex);
    require(prevProductionRate >= amount, "[ProductionUsage] not enough production rate to reduce usage");
    ProductionRate.set(playerEntity, resourceIndex, prevProductionRate - amount);
  }
}
