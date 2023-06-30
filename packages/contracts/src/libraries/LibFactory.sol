// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "../components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "../components/FactoryProductionComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { LibDebug } from "./LibDebug.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibStorage } from "./LibStorage.sol";
import { LibMath } from "./LibMath.sol";
import { LibTerrain } from "./LibTerrain.sol";
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

library LibFactory {
  function checkCanConnectMineToFactoryAndUpdateFactoryConnectedMineCount(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    Uint256Component tileComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal returns (bool) {
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) {
          factoryMineBuildingsData.MineBuildingCount[i]--;
          factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
          return true;
        }
        return false;
      }
    }
    return false;
  }

  function checkIsFactoryFunctional(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    Uint256Component pathComponent,
    uint256 factoryEntity
  ) internal returns (bool) {
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    uint256 factoryLevelEntity = LibEncode.hashFromKey(tileComponent.getValue(factoryEntity), factoryLevel);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(
      factoryLevelEntity
    );
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        factoryIsFunctionalComponent.remove(factoryEntity);
        return false;
      }
      for (uint256 j = 0; j < factoryMineBuildingsData.MineBuildingCount.length; j++) {
        if (factoryMineBuildingsData.MineBuildingIDs[j] == tileComponent.getValue(connectedMineEntities[i])) {
          factoryMineBuildingsData.MineBuildingCount[j]--;
        }
      }
    }
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingCount[i] > 0) {
        factoryIsFunctionalComponent.remove(factoryEntity);
        return false;
      }
    }
    factoryIsFunctionalComponent.set(factoryEntity);
    return true;
  }

  function checkFactoryConnectedMinesLevelCondition(
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component buildingComponent,
    Uint256Component pathComponent,
    uint256 factoryEntity
  ) internal returns (bool) {
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        factoryIsFunctionalComponent.remove(factoryEntity);
        return false;
      }
    }
    factoryIsFunctionalComponent.set(factoryEntity);
    return true;
  }

  function checkFactoryConnectedMinesCountCondition(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 factoryEntity
  ) internal returns (bool) {
    uint256 factoryLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(
      factoryLevelEntity
    );
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingCount[i] > 0) {
        factoryIsFunctionalComponent.remove(factoryEntity);
        return false;
      }
    }
    factoryIsFunctionalComponent.set(factoryEntity);
    return true;
  }

  //call after upgrade has been done and level has been increased
  function checkAndUpdateResourceProductionOnUpgradeFactory(
    FactoryProductionComponent factoryProductionComponent,
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component mineComponent,
    Uint256Component tileComponent,
    Uint256Component buildingComponent,
    Uint256Component pathComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    uint256 buildingLevelEntityPreUpgrade = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity) - 1
    );

    FactoryProductionData memory factoryProductionDataPreUpgrade = factoryProductionComponent.getValue(
      buildingLevelEntityPreUpgrade
    );
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionDataPreUpgrade.ResourceID, playerEntity);
    if (
      checkFactoryConnectedMinesLevelCondition(
        factoryIsFunctionalComponent,
        buildingComponent,
        pathComponent,
        factoryEntity
      )
    ) {
      uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
        tileComponent.getValue(factoryEntity),
        buildingComponent.getValue(factoryEntity)
      );
      FactoryProductionData memory factoryProductionDataAfterUpgrade = factoryProductionComponent.getValue(
        buildingLevelEntity
      );
      uint256 resourceProductionIncreaseOfFactory = factoryProductionDataAfterUpgrade.ResourceProductionRate -
        factoryProductionDataPreUpgrade.ResourceProductionRate;
      mineComponent.set(
        playerResourceEntity,
        mineComponent.getValue(playerResourceEntity) + resourceProductionIncreaseOfFactory
      );
    } else {
      mineComponent.set(
        playerResourceEntity,
        mineComponent.getValue(playerResourceEntity) - factoryProductionDataPreUpgrade.ResourceProductionRate
      );
    }
  }

  function updateResourceProductionOnDestroyPathFromFactoryToMainBase(
    FactoryProductionComponent factoryProductionComponent,
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component mineComponent, //writes to
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;
    uint256 buildingId = tileComponent.getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(factoryEntity));
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    mineComponent.set(
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) - factoryProductionData.ResourceProductionRate
    );
  }

  function updateResourceProductionOnBuildPathFromFactoryToMainBase(
    FactoryProductionComponent factoryProductionComponent,
    BoolComponent factoryIsFunctionalComponent,
    Uint256Component mineComponent, //writes to
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;
    uint256 buildingId = tileComponent.getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(factoryEntity));
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    mineComponent.set(
      playerResourceEntity, //player resource production entity
      LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + factoryProductionData.ResourceProductionRate //current total resource production // resource production of factory
    );
  }
}
