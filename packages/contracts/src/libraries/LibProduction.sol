// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { P_RequiredDependencies, P_RequiredDependenciesData, P_Production, P_ProductionData, ProductionRate, Level } from "codegen/Tables.sol";
import { EResource } from "src/Types.sol";

library LibProduction {
  function clearProductionUsage(bytes32 playerEntity, bytes32 buildingPrototype) internal {
    uint32 level = Level.get(buildingPrototype);
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint32 requiredValue = requiredDeps.amounts[i];
      if (requiredValue == 0) continue;
      P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, level);
      uint32 productionRate = ProductionRate.get(playerEntity, resource);
      require(
        productionRate < prototypeProduction.amount,
        "[ProductionUsage] not enough production rate to clear usage"
      );

      ProductionRate.set(playerEntity, resource, ProductionRate.get(playerEntity, resource) + requiredValue);
    }
  }

  function increaseProductionUsage(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    uint32 level
  ) internal {
    P_RequiredDependenciesData memory requiredDeps = P_RequiredDependencies.get(buildingPrototype, level);
    P_RequiredDependenciesData memory prevRequiredDeps;
    if (level > 1) {
      prevRequiredDeps = P_RequiredDependencies.get(buildingPrototype, level - 1);
    }

    for (uint256 i = 0; i < requiredDeps.resources.length; i++) {
      EResource resource = EResource(requiredDeps.resources[i]);
      uint32 requiredValue = requiredDeps.amounts[i];
      requiredValue -= prevRequiredDeps.amounts[i];
      if (requiredValue == 0) continue;

      uint32 productionRate = ProductionRate.get(playerEntity, resource);
      require(productionRate >= requiredValue, "[ProductionUsage] not enough production rate to increase usage");

      ProductionRate.set(playerEntity, resource, ProductionRate.get(playerEntity, resource) - requiredValue);
    }
  }
}
