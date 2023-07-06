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

import { LibEncode } from "../libraries/LibEncode.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

import { LibSetRequiredResources } from "libraries/LibSetRequiredResources.sol";

library LibTechnologyDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );

    // Research FastMiner with 100 IronResource and 100 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      FastMinerResearchID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      100
    );

    // Research Copper with 30 IronResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      CopperResearchID,
      IronResourceItemID,
      30
    );

    // Research PlatingFactory with 200 IronResource and 200 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PlatingFactoryResearchID,
      IronResourceItemID,
      200,
      CopperResourceItemID,
      200
    );

    // Research Lithium with 20 IronPlateCrafted and 100 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      LithiumResearchID,
      IronPlateCraftedItemID,
      20,
      CopperResourceItemID,
      100
    );

    // Research BasicBatteryFactory with 50 IronPlateCrafted and 100 LithiumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      BasicBatteryFactoryResearchID,
      IronPlateCraftedItemID,
      50,
      LithiumResourceItemID,
      100
    );

    // Research KineticMissileFactory with 50 BasicPowerSourceCrafted and 100 IronResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KineticMissileFactoryResearchID,
      BasicPowerSourceCraftedItemID,
      50,
      IronResourceItemID,
      100
    );

    // Research Titanium with 50 BasicPowerSourceCrafted
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      TitaniumResearchID,
      BasicPowerSourceCraftedItemID,
      50
    );

    // Research ProjectileLauncher with 50 BasicPowerSourceCrafted and 500 TitaniumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ProjectileLauncherResearchID,
      BasicPowerSourceCraftedItemID,
      50,
      TitaniumResourceItemID,
      500
    );

    // Research HardenedDrill with 200 TitaniumResource, 500 IronPlateCrafted, and 50 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HardenedDrillResearchID,
      TitaniumResourceItemID,
      200,
      IronPlateCraftedItemID,
      500,
      BasicPowerSourceCraftedItemID,
      50
    );

    // Research Osmium with 300 TitaniumResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      OsmiumResearchID,
      TitaniumResourceItemID,
      300
    );

    // Research DenseMetalRefinery with 100 OsmiumResource, 300 TitaniumResource, and 100 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      DenseMetalRefineryResearchID,
      OsmiumResourceItemID,
      100,
      TitaniumResourceItemID,
      300,
      BasicPowerSourceCraftedItemID,
      100
    );

    // Research AdvancedBatteryFactory with 200 OsmiumResource, 100 IronPlateCrafted, and 400 TitaniumResource
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      AdvancedBatteryFactoryResearchID,
      OsmiumResourceItemID,
      200,
      IronPlateCraftedItemID,
      100,
      TitaniumResourceItemID,
      400
    );

    // Research Tungsten with 100 RefinedOsmiumCrafted 200 TitaniumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      TungstenResearchID,
      RefinedOsmiumCraftedItemID,
      100,
      TitaniumResourceItemID,
      200
    );

    // Research HighTempFoundry with 200 TungstenResource, 100 OsmiumResource, 50 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighTempFoundryResearchID,
      TungstenResourceItemID,
      200,
      OsmiumResourceItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      50
    );

    // Research Iridium with 100 TungstenRodCrafted 100 OsmiumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IridiumResearchID,
      TungstenRodsCraftedItemID,
      100,
      OsmiumResourceItemID,
      100
    );

    // Research PrecisionMachineryFactory with 200 IridiumResource and 100 TungstenRodsCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionMachineryFactoryResearchID,
      IridiumResourceItemID,
      200,
      TungstenRodsCraftedItemID,
      100
    );

    // Research IridiumDrillbitFactory with 100 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IridiumDrillbitFactoryResearchID,
      IridiumCrystalCraftedItemID,
      100,
      LaserPowerSourceCraftedItemID,
      20
    );

    // Research PrecisionPneumaticDrill with 200 TungstenRodsCrafted and 50 IridiumDrillbitCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionPneumaticDrillResearchID,
      TungstenRodsCraftedItemID,
      200,
      IridiumDrillbitCraftedItemID,
      50
    );

    // Research PenetratorFactory with 500 OsmiumResource and 50 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratorFactoryResearchID,
      OsmiumResourceItemID,
      500,
      AdvancedPowerSourceCraftedItemID,
      50
    );

    // Research PenetratingMissileFactory with 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratingMissileFactoryResearchID,
      RefinedOsmiumCraftedItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      50
    );

    // Research MissileLaunchComplex with 50 TungstenRodsCrafted and 100 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      MissileLaunchComplexResearchID,
      TungstenRodsCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      100
    );

    // Research HighEnergyLaserFactory with 200 IridiumCrystalCrafted 150 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighEnergyLaserFactoryResearchID,
      IridiumCrystalCraftedItemID,
      200,
      AdvancedPowerSourceCraftedItemID,
      150
    );

    // Research ThermobaricWarheadFactory with 200 IridiumCrystalCrafted
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      ThermobaricWarheadFactoryResearchID,
      IridiumCrystalCraftedItemID,
      200
    );

    // Resesarch ThermobaricMissileFactory with 200 IridiumCrystalCrafted and 100 TungstenRodsCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ThermobaricMissileFactoryResearchID,
      IridiumCrystalCraftedItemID,
      200,
      TungstenRodsCraftedItemID,
      100
    );

    // Research Kimberlite with 100 IridiumCrystalCrafted 100 TungstenResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KimberliteResearchID,
      IridiumCrystalCraftedItemID,
      100,
      TungstenResourceItemID,
      100
    );

    // Research KimberliteCatalystFactory with 300 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KimberliteCatalystFactoryResearchID,
      IridiumCrystalCraftedItemID,
      300,
      LaserPowerSourceCraftedItemID,
      20
    );
  }
}
