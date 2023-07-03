// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";

import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

library LibStorageDesignInitializer {
  function init(IWorld world) internal {
    uint256[25] memory allResourceIds = [
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

    IUint256Component components = world.components();
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );

    uint256[] memory storageCapacity = new uint256[](allResourceIds.length);

    //MainBaseID Level 1 Storage
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 1);
    for (uint256 i = 0; i < allResourceIds.length; i++) {
      storageCapacityComponent.set(LibEncode.hashKeyEntity(allResourceIds[i], buildingIdLevel), uint256(1000000000000));
      storageCapacity[i] = allResourceIds[i];
    }
    storageCapacityResourcesComponent.set(buildingIdLevel, storageCapacity);
  }
}
