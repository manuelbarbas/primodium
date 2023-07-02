// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "../components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "../components/FactoryProductionComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { LibEncode } from "./LibEncode.sol";
import { LibStorage } from "./LibStorage.sol";
import { LibMath } from "./LibMath.sol";
import { LibTerrain } from "./LibTerrain.sol";

library LibFactory {
  //checks all required conditions for a factory to be functional and updates factory is functional status
  function updateFactoryIsFunctional(
    BoolComponent factoryIsFunctionalComponent, //writes
    FactoryMineBuildingsComponent factoryMineBuildingsComponent, //writes
    Uint256Component pathComponent,
    Uint256Component buildingComponent,
    uint256 factoryEntity
  ) internal {
    if (
      checkFactoryConnectedMinesCountCondition(factoryMineBuildingsComponent, factoryEntity) &&
      checkFactoryConnectedMinesLevelCondition(
        factoryIsFunctionalComponent,
        buildingComponent,
        pathComponent,
        factoryEntity
      )
    ) {
      factoryIsFunctionalComponent.set(factoryEntity);
    } else {
      factoryIsFunctionalComponent.remove(factoryEntity);
    }
  }

  function checkFactoryConnectedMinesLevelCondition(
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component buildingComponent,
    Uint256Component pathComponent,
    uint256 factoryEntity
  ) internal view returns (bool) {
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) return false;
    }
    return true;
  }

  function checkFactoryConnectedMinesCountCondition(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    uint256 factoryEntity
  ) internal view returns (bool) {
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingCount[i] > 0) {
        return false;
      }
    }
    return true;
  }

  function updateResourceProductionOnFactoryIsFunctionalChange(
    FactoryProductionComponent factoryProductionComponent,
    Uint256Component mineComponent,
    uint256 playerEntity,
    uint256 factoryBuildingLevelEntity,
    bool isFunctional
  ) internal {
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(
      factoryBuildingLevelEntity
    );
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    if (isFunctional)
      mineComponent.set(
        playerResourceEntity, //player resource production entity
        LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + factoryProductionData.ResourceProductionRate
      );
    else
      mineComponent.set(
        playerResourceEntity, //player resource production entity
        LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) - factoryProductionData.ResourceProductionRate
      );
  }
}
