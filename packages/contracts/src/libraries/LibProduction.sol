// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BuildingType, Level, P_Production, P_ProductionData, P_IsUtility, ProductionRate } from "codegen/Tables.sol";
import { EActionType, EResource } from "src/Types.sol";
import { LibStorage } from "libraries/LibStorage.sol";

library LibProduction {
  function clearResourceProduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint32 buildingLevel = Level.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, buildingLevel);
    EResource resource = EResource(prototypeProduction.resource);
    if (P_IsUtility.get(resource)) {
      LibStorage.decreaseMaxUtility(playerEntity, resource, prototypeProduction.amount);
      return;
    }
    ProductionRate.deleteRecord(buildingEntity, resource);
  }

  function upgradeResourceProduction(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint32 targetLevel
  ) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, targetLevel);
    P_ProductionData memory prevLevelPrototypeProduction = P_Production.get(buildingPrototype, targetLevel - 1);
    uint32 newProductionRate = prototypeProduction.amount - prevLevelPrototypeProduction.amount;
    EResource resource = EResource(prototypeProduction.resource);
    if (P_IsUtility.get(resource)) {
      LibStorage.increaseMaxUtility(playerEntity, resource, newProductionRate);
      return;
    }
    uint32 productionRate = ProductionRate.get(playerEntity, resource) + newProductionRate;
    ProductionRate.set(buildingEntity, resource, productionRate);
  }

  function initResourceProduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint32 buildingLevel = 1;

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, buildingLevel);
    EResource resource = EResource(prototypeProduction.resource);

    if (P_IsUtility.get(resource)) {
      LibStorage.increaseMaxUtility(playerEntity, resource, prototypeProduction.amount);
      return;
    }
    uint32 productionRate = ProductionRate.get(playerEntity, resource) + prototypeProduction.amount;
    ProductionRate.set(buildingEntity, resource, productionRate);
  }
}
