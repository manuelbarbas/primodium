// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BuildingType, Level, P_Production, P_ProductionData, P_IsUtility, ProductionRate } from "codegen/Tables.sol";
import { EActionType, EResource } from "src/Types.sol";
import { LibStorage } from "libraries/LibStorage.sol";

library LibProduction {
  function upgradeResourceProduction(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint32 targetLevel
  ) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, targetLevel);
    EResource resource = EResource(prototypeProduction.resource);
    uint32 prevLevelPrototypeProduction = targetLevel > 1
      ? P_Production.get(buildingPrototype, targetLevel - 1).amount
      : 0;
    uint32 addedProductionRate = prototypeProduction.amount - prevLevelPrototypeProduction;
    if (addedProductionRate == 0) return;
    if (P_IsUtility.get(resource)) {
      LibStorage.increaseMaxUtility(playerEntity, resource, addedProductionRate);
      return;
    }
    uint32 productionRate = ProductionRate.get(playerEntity, resource) + addedProductionRate;
    ProductionRate.set(playerEntity, resource, productionRate);
  }

  function clearResourceProduction(bytes32 playerEntity, bytes32 buildingEntity) internal {
    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint32 buildingLevel = Level.get(buildingEntity);

    P_ProductionData memory prototypeProduction = P_Production.get(buildingPrototype, buildingLevel);
    if (prototypeProduction.amount == 0) return;
    EResource resource = EResource(prototypeProduction.resource);
    if (P_IsUtility.get(resource)) {
      LibStorage.decreaseMaxUtility(playerEntity, resource, prototypeProduction.amount);
      return;
    }

    uint32 prevProductionRate = ProductionRate.get(playerEntity, resource);
    require(
      prevProductionRate >= prototypeProduction.amount,
      "[ProductionUsage] not enough production rate to reduce usage"
    );
    ProductionRate.set(playerEntity, resource, prevProductionRate - prototypeProduction.amount);
  }
}
