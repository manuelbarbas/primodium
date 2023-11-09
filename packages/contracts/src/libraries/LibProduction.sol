// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { P_IsAdvancedResource, P_MiningRate, ResourceCount, BuildingType, Level, P_Production, P_ProductionData, P_IsUtility, ProductionRate } from "codegen/index.sol";
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

    uint256 lastLevelResourceLength;
    uint256[] memory lastLevelAmounts;

    if (targetLevel > 1) {
      lastLevelResourceLength = P_Production.lengthAmounts(buildingPrototype, targetLevel - 1);
      lastLevelAmounts = P_Production.get(buildingPrototype, targetLevel - 1).amounts;
    }
    for (uint8 i = 0; i < prototypeProduction.resources.length; i++) {
      uint256 prevLevelPrototypeProduction = 0;
      if (targetLevel > 1 && lastLevelResourceLength > i) {
        prevLevelPrototypeProduction = lastLevelAmounts[i];
      }
      uint256 addedProductionRate = prototypeProduction.amounts[i] - prevLevelPrototypeProduction;
      increaseResourceProduction(playerEntity, EResource(prototypeProduction.resources[i]), addedProductionRate);
    }
  }

  function upgradeUnitResourceProduction(
    bytes32 playerEntity,
    bytes32 unitPrototype,
    uint256 level
  ) internal {
    uint256 miningRate = P_MiningRate.get(unitPrototype, level);
    if (miningRate == 0) return;
    uint256 lastLevelMiningRate = P_MiningRate.get(unitPrototype, level - 1);
    for (uint8 resource = 1; resource < uint8(EResource.LENGTH); resource++) {
      if (!P_IsAdvancedResource.get(resource)) continue;
      uint256 currProduction = ProductionRate.get(playerEntity, resource);
      if (currProduction > 0)
        ProductionRate.set(playerEntity, resource, ((currProduction * miningRate) / lastLevelMiningRate));
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
      require(availableUtility >= amount, "[UtilityUsage] Cannot decrease utility amount below 0");
      LibStorage.decreaseStoredResource(playerEntity, resourceIndex, amount);
      LibStorage.decreaseMaxUtility(playerEntity, resourceIndex, amount);
      return;
    }
    uint256 prevProductionRate = ProductionRate.get(playerEntity, resourceIndex);
    require(prevProductionRate >= amount, "[ProductionUsage] Cannot decrease resource production below 0");
    ProductionRate.set(playerEntity, resourceIndex, prevProductionRate - amount);
  }
}
