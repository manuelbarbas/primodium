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
  //Mine changes to Factory Changes

  //checks if path from mine to factory can be built, if yes updates factory is functional status
  function checkOnBuildPathFromMineToFactory(
    BoolComponent factoryIsFunctionalComponent,
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    Uint256Component pathComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal returns (bool) {
    if (factoryIsFunctionalComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    bool isFunctional = true;
    bool isMineConnected = false;
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        if (factoryMineBuildingsData.MineBuildingCount[i] <= 0) return false;
        factoryMineBuildingsData.MineBuildingCount[i]--;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        isMineConnected = true;
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
        if (buildingComponent.getValue(mineEntity) < factoryLevel) isFunctional = false;
      } else {
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
      }
    }

    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        isFunctional = false;
        return isMineConnected;
      }
    }

    if (isFunctional) {
      factoryIsFunctionalComponent.set(factoryEntity);
    }

    return isMineConnected;
  }

  //when a path from mine to factory is destroyed, factory becomes non functional and required connected mine building count is increased
  function onPathFromMineToFactoryDestroyed(
    BoolComponent factoryIsFunctionalComponent, //writes
    FactoryMineBuildingsComponent factoryMineBuildingsComponent, //writes
    Uint256Component tileComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {
    factoryIsFunctionalComponent.remove(factoryEntity);
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        factoryMineBuildingsData.MineBuildingCount[i]++;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        return;
      }
    }
  }

  //when a mine connected to a factory is upgraded all mines connected to that factory are checked if they are at the required level and if the number of connected mines is enough
  function onMineConnectedToFactoryUpgrade(
    BoolComponent factoryIsFunctionalComponent, //writes
    FactoryMineBuildingsComponent factoryMineBuildingsComponent, //writes
    Uint256Component pathComponent,
    Uint256Component buildingComponent,
    uint256 factoryEntity
  ) internal {
    if (factoryIsFunctionalComponent.has(factoryEntity)) return;
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        return;
      }
    }
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingCount[i] > 0) return;
    }
    factoryIsFunctionalComponent.set(factoryEntity);
  }

  //checks all required conditions for a factory to be functional and updates factory is functional status
  function updateFactoryIsFunctional(
    BoolComponent factoryIsFunctionalComponent, //writes
    FactoryMineBuildingsComponent factoryMineBuildingsComponent, //writes
    Uint256Component pathComponent,
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {}

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
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;
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
      factoryIsFunctionalComponent.remove(factoryEntity);
      mineComponent.set(
        playerResourceEntity,
        mineComponent.getValue(playerResourceEntity) - factoryProductionDataPreUpgrade.ResourceProductionRate
      );
    }
  }

  //Final
  //call after upgrade has been done and level has been increased
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

  //Final
  //call after upgrade has been done and level has been increased
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

  function updateResourceProductionOnFactoryIsFunctionalChange(
    FactoryProductionComponent factoryProductionComponent,
    Uint256Component mineComponent,
    Uint256Component tileComponent,
    Uint256Component buildingComponent,
    uint256 playerEntity,
    uint256 factoryEntity,
    bool isFunctional
  ) internal {
    uint256 buildingId = tileComponent.getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(factoryEntity));
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(buildingLevelEntity);
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
