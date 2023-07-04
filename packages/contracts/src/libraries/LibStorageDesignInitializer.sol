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
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

library LibStorageDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );

    //MainBaseID Level 1 Storage
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 1);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      200
    );

    //MainBaseID Level 2 Storage
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 2);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      400,
      CopperResourceItemID,
      400
    );

    //MainBaseID Level 3 Storage
    buildingIdLevel = LibEncode.hashKeyEntity(MainBaseID, 3);
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      storageCapacityResourcesComponent,
      storageCapacityComponent,
      buildingIdLevel,
      IronResourceItemID,
      600,
      CopperResourceItemID,
      600,
      LithiumResourceItemID,
      600
    );
  }
}
