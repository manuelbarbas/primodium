// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { MinerID, LithiumMinerID, BasicMinerID, HardenedDrillID, PrecisionPneumaticDrillID, BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";

import { LibDebug } from "./LibDebug.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibStorage } from "./LibStorage.sol";
import { LibMath } from "./LibMath.sol";
import { LibTerrain } from "./LibTerrain.sol";
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

library LibNewMine {
  function claimResourcesFromMines(
    Uint256Component itemComponent, //writes to
    Uint256Component lastClaimedAtComponent, //writes to
    Uint256Component unclaimedResourceComponent, //writes to
    Uint256Component mineComponent,
    Uint256Component storageCapacityComponent,
    uint256 playerEntity
  ) internal {
    uint256[25] memory storageResourceIds = getAllResourceIds();
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (!mineComponent.has(playerResourceEntity)) continue;
      updateUnclaimedForResource(
        unclaimedResourceComponent,
        lastClaimedAtComponent,
        mineComponent,
        storageCapacityComponent,
        itemComponent,
        playerEntity,
        storageResourceIds[i]
      );
      LibStorage.addResourceToStorage(
        itemComponent,
        storageCapacityComponent,
        storageResourceIds[i],
        unclaimedResourceComponent.getValue(playerEntity),
        playerEntity
      );
    }
  }

  function getAllResourceIds() internal pure returns (uint256[25] memory) {
    return [
      BolutiteResourceItemID,
      CopperResourceItemID,
      IridiumResourceItemID,
      IronResourceItemID,
      KimberliteResourceItemID,
      LithiumResourceItemID,
      OsmiumResourceItemID,
      TitaniumResourceItemID,
      TungstenResourceItemID,
      UraniniteResourceItemID,
      IronPlateCraftedItemID,
      BasicPowerSourceCraftedItemID,
      KineticMissileCraftedItemID,
      RefinedOsmiumCraftedItemID,
      AdvancedPowerSourceCraftedItemID,
      PenetratingWarheadCraftedItemID,
      PenetratingMissileCraftedItemID,
      TungstenRodsCraftedItemID,
      IridiumCrystalCraftedItemID,
      IridiumDrillbitCraftedItemID,
      LaserPowerSourceCraftedItemID,
      ThermobaricWarheadCraftedItemID,
      ThermobaricMissileCraftedItemID,
      KimberliteCrystalCatalystCraftedItemID,
      BulletCraftedItemID
    ];
  }

  function updateUnclaimedForResource(
    Uint256Component unclaimedResourceComponent, //writes to
    Uint256Component lastClaimedAtComponent, //writes to
    Uint256Component mineComponent,
    Uint256Component storageComponent,
    Uint256Component itemComponent,
    uint256 playerEntity,
    uint256 resourceId
  ) internal {
    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    // if (LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity) == block.number) {
    //   return;
    // }
    uint256 playerResourceProduction = LibMath.getSafeUint256Value(mineComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }
    uint256 availableSpaceInStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }
    uint256 unclaimedResource = LibMath.getSafeUint256Value(unclaimedResourceComponent, playerResourceProductionEntity);
    for (uint256 i = 0; i < playerResourceProduction; i++) {
      unclaimedResource += (block.number -
        LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity));
    }

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    unclaimedResourceComponent.set(playerEntity, unclaimedResource);
  }

  //call after upgrade has been done and level has been increased
  function checkAndUpdateResourceProductionOnUpgradeMine(
    Uint256Component mineComponent, //writes to
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 fromEntity
  ) internal {
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(fromEntity),
      buildingComponent.getValue(fromEntity)
    );
    uint256 buildingLevelEntityPreUpgrade = LibEncode.hashKeyEntity(
      tileComponent.getValue(fromEntity),
      buildingComponent.getValue(fromEntity) - 1
    );
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint256 resourceProductionIncreaseOfMine = mineComponent.getValue(buildingLevelEntity) -
      mineComponent.getValue(buildingLevelEntityPreUpgrade);
    mineComponent.set(
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) + resourceProductionIncreaseOfMine
    );
  }

  function updateResourceProductionOnDestroyPathFromMine(
    Uint256Component mineComponent, //writes to
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 fromEntity
  ) internal {
    uint256 buildingId = tileComponent.getValue(fromEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(fromEntity));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 resourceProductionOfMine = mineComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    mineComponent.set(playerResourceEntity, mineComponent.getValue(playerResourceEntity) - resourceProductionOfMine);
  }

  function updateResourceProductionOnBuildPathFromMine(
    Uint256Component mineComponent, //writes to
    Uint256Component buildingComponent,
    Uint256Component tileComponent,
    uint256 playerEntity,
    uint256 fromEntity
  ) internal {
    uint256 buildingId = tileComponent.getValue(fromEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(fromEntity));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    require(mineComponent.has(buildingLevelEntity), "Mine level entity not found");
    mineComponent.set(
      playerResourceEntity, //player resource production entity
      LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + mineComponent.getValue(buildingLevelEntity) //current total resource production // resource production of mine
    );
  }
}
