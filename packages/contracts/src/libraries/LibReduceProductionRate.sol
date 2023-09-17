// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_RequiredDependencies, P_RequiredDependenciesData, P_Production, ProductionRate, Level, BuildingType } from "codegen/Tables.sol";
import { EResource } from "src/Types.sol";
import { ResourceSelector } from "@latticexyz/world/src/ResourceSelector.sol";

library LibReduceProductionRate {
  function clearProductionRateReduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    uint32 level = Level.get(buildingEntity);
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint32 requiredValue = requiredDeps.amounts[i];
      if (requiredValue == 0) continue;
      uint32 productionRate = ProductionRate.get(playerEntity, resource);

      ProductionRate.set(playerEntity, resource, productionRate + requiredValue);
    }
  }

  function reduceProductionRate(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint32 level
  ) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);
    P_RequiredDependenciesData memory prevRequiredDeps;
    if (level > 1) {
      prevRequiredDeps = P_RequiredDependencies.get(buildingPrototype, level - 1);
    }

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint32 prevAmount = level > 1 ? prevRequiredDeps.amounts[i] : 0;
      uint32 requiredValue = requiredDeps.amounts[i] - prevAmount;
      if (requiredValue == 0) continue;

      uint32 productionRate = ProductionRate.get(playerEntity, resource);
      require(productionRate >= requiredValue, "[ProductionUsage] not enough production rate to reduce usage");
      ProductionRate.set(playerEntity, resource, productionRate - requiredValue);
    }
  }
}
