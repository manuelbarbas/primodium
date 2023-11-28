// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { OwnedBy, P_RequiredDependencies, P_RequiredDependenciesData, P_Production, ProductionRate, Level, BuildingType } from "codegen/index.sol";

library LibReduceProductionRate {
  /// @notice Restores production rate when a building is destroyed
  /// @param buildingEntity Entity ID of the building
  function clearProductionRateReduction(bytes32 buildingEntity) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    uint256 level = Level.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      uint8 resource = requiredDeps.resources[i];
      uint256 requiredValue = requiredDeps.amounts[i];
      if (requiredValue == 0) continue;
      uint256 productionRate = ProductionRate.get(spaceRockEntity, resource);

      ProductionRate.set(spaceRockEntity, resource, productionRate + requiredValue);
    }
  }

  /// @notice Reduces production rate when building or upgrading
  /// @param buildingEntity Entity ID of the building
  /// @param level Target level for the building
  function reduceProductionRate(bytes32 buildingEntity, uint256 level) internal {
    bytes32 spaceRockEntity = OwnedBy.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);
    P_RequiredDependenciesData memory prevRequiredDeps;
    if (level > 1) {
      prevRequiredDeps = P_RequiredDependencies.get(buildingPrototype, level - 1);
    }

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      uint8 resource = requiredDeps.resources[i];
      uint256 prevAmount = level > 1 ? prevRequiredDeps.amounts[i] : 0;
      uint256 requiredValue = requiredDeps.amounts[i] - prevAmount;
      if (requiredValue == 0) continue;

      uint256 productionRate = ProductionRate.get(spaceRockEntity, resource);
      require(productionRate >= requiredValue, "[ProductionUsage] Not enough resource production rate");
      ProductionRate.set(spaceRockEntity, resource, productionRate - requiredValue);
    }
  }
}
