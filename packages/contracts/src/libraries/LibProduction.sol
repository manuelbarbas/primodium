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
    for (uint8 i = 0; i < prototypeProduction.resources.length; i++) {
      uint256 prevLevelPrototypeProduction = 0;
      if (targetLevel > 1 && P_Production.lengthAmounts(buildingPrototype, targetLevel - 1) > i) {
        prevLevelPrototypeProduction = P_Production.get(buildingPrototype, targetLevel - 1).amounts[i];
      }
      uint256 addedProductionRate = prototypeProduction.amounts[i] - prevLevelPrototypeProduction;
      increaseResourceProduction(playerEntity, EResource(prototypeProduction.resources[i]), addedProductionRate);
    }
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
    for (uint8 i = 0; i < prototypeProduction.resources.length; i++) {
      decreaseResourceProduction(
        playerEntity,
        EResource(prototypeProduction.resources[i]),
        prototypeProduction.amounts[i]
      );
    }
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
