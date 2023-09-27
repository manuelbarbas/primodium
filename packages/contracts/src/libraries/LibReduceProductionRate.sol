// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { P_RequiredDependencies, P_RequiredDependenciesData, P_Production, ProductionRate, Level, BuildingType } from "codegen/index.sol";
import { EResource } from "src/Types.sol";

library LibReduceProductionRate {
  /// @notice Restores production rate when a building is destroyed
  /// @param playerEntity Entity ID of the player
  /// @param buildingEntity Entity ID of the building
  function clearProductionRateReduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    uint256 level = Level.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint256 requiredValue = requiredDeps.amounts[i];
      if (requiredValue == 0) continue;
      uint256 productionRate = ProductionRate.get(playerEntity, resource);

      ProductionRate.set(playerEntity, resource, productionRate + requiredValue);
    }
  }

  /// @notice Reduces production rate when building or upgrading
  /// @param playerEntity Entity ID of the player
  /// @param buildingEntity Entity ID of the building
  /// @param level Target level for the building
  function reduceProductionRate(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);
    P_RequiredDependenciesData memory prevRequiredDeps;
    if (level > 1) {
      prevRequiredDeps = P_RequiredDependencies.get(buildingPrototype, level - 1);
    }

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint256 prevAmount = level > 1 ? prevRequiredDeps.amounts[i] : 0;
      uint256 requiredValue = requiredDeps.amounts[i] - prevAmount;
      if (requiredValue == 0) continue;

      uint256 productionRate = ProductionRate.get(playerEntity, resource);
      require(productionRate >= requiredValue, "[ProductionUsage] not enough production rate to reduce usage");
      ProductionRate.set(playerEntity, resource, productionRate - requiredValue);
    }
  }
}
