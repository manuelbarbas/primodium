// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/interfaces/IWorld.sol";
import { getAddressById } from "solecs/utils.sol";
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibSetRequiredResources } from "../libraries/LibSetRequiredResources.sol";
// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

library LibBuildingUpgradeDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );

    //MainBaseID Level 2 Upgrade
    uint256 buildingIdLevel = LibEncode.hashFromKey(MainBaseID, 2);
    itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, buildingIdLevel), 500);
    itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, buildingIdLevel), 500);
    uint256[] memory requiredResourceIDs = new uint256[](2);
    requiredResourceIDs[0] = IronResourceItemID;
    requiredResourceIDs[1] = CopperResourceItemID;
    requiredResources.set(buildingIdLevel, requiredResourceIDs);

    //MainBaseID Level 3 Upgrade
    buildingIdLevel = LibEncode.hashFromKey(MainBaseID, 3);
    itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, buildingIdLevel), 500);
    itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, buildingIdLevel), 100);
    itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, buildingIdLevel), 2000);
    requiredResourceIDs = new uint256[](3);
    requiredResourceIDs[0] = IronPlateCraftedItemID;
    requiredResourceIDs[1] = BasicPowerSourceCraftedItemID;
    requiredResourceIDs[2] = CopperResourceItemID;
    requiredResources.set(buildingIdLevel, requiredResourceIDs);
  }

  function set1RequiredResourceForEntityLevel(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1
    );
  }

  function set2RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2
    );
  }

  function set3RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2,
      resourceId3,
      resourceCost3
    );
  }

  function set4RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3,
    uint256 resourceId4,
    uint256 resourceCost4,
    uint256 level
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashFromKey(entity, level);
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      requiredResourcesComponent,
      itemComponent,
      buildingIdLevel,
      resourceId1,
      resourceCost1,
      resourceId2,
      resourceCost2,
      resourceId3,
      resourceCost3,
      resourceId4,
      resourceCost4
    );
  }
}
