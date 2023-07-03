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
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";

library LibBuildingDesignInitializer {
  function init(IWorld world) internal {
    IUint256Component components = world.components();
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResearchComponent requiredResearch = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    RequiredResourcesComponent requiredResources = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );

    //BasicMinerId
    // Build BasicMiner with 100 IronResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      BasicMinerID,
      IronResourceItemID,
      100
    );

    //Node
    // Build Node with 50 IronResource
    LibSetRequiredResources.set1RequiredResourceForEntity(
      requiredResources,
      itemComponent,
      NodeID,
      IronResourceItemID,
      50
    );

    //PlatingFactoryID
    // Build PlatingFactory with 100 IronResource and 50 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PlatingFactoryID,
      IronResourceItemID,
      100,
      CopperResourceItemID,
      50
    );

    requiredResearch.set(PlatingFactoryID, PlatingFactoryResearchID);

    //BasicBatteryFactoryID
    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      BasicBatteryFactoryID,
      IronPlateCraftedItemID,
      20,
      CopperResourceItemID,
      50
    );

    requiredResearch.set(BasicBatteryFactoryID, BasicBatteryFactoryResearchID);

    //KineticMissileFactoryID
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KineticMissileFactoryID,
      IronPlateCraftedItemID,
      100,
      LithiumResourceItemID,
      50,
      BasicPowerSourceCraftedItemID,
      10
    );

    requiredResearch.set(KineticMissileFactoryID, KineticMissileFactoryResearchID);

    //ProjectileLauncherID
    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ProjectileLauncherID,
      IronPlateCraftedItemID,
      100,
      TitaniumResourceItemID,
      100
    );

    requiredResearch.set(ProjectileLauncherID, ProjectileLauncherResearchID);

    //HardenedDrillID
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HardenedDrillID,
      TitaniumResourceItemID,
      100,
      IronPlateCraftedItemID,
      10,
      BasicPowerSourceCraftedItemID,
      5
    );

    requiredResearch.set(HardenedDrillID, HardenedDrillResearchID);

    //DenseMetalRefineryID
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    LibSetRequiredResources.set4RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      DenseMetalRefineryID,
      OsmiumResourceItemID,
      50,
      TitaniumResourceItemID,
      100,
      IronPlateCraftedItemID,
      30,
      BasicPowerSourceCraftedItemID,
      10
    );

    requiredResearch.set(DenseMetalRefineryID, DenseMetalRefineryResearchID);

    //AdvancedBatteryFactoryID
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      AdvancedBatteryFactoryID,
      OsmiumResourceItemID,
      150,
      TitaniumResourceItemID,
      50,
      BasicPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(AdvancedBatteryFactoryID, AdvancedBatteryFactoryResearchID);

    //HighTempFoundryID
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighTempFoundryID,
      TungstenResourceItemID,
      50,
      RefinedOsmiumCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      20
    );

    requiredResearch.set(HighTempFoundryID, HighTempFoundryResearchID);

    //PrecisionMachineryFactoryID
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionMachineryFactoryID,
      IridiumResourceItemID,
      50,
      TungstenRodsCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(PrecisionMachineryFactoryID, PrecisionMachineryFactoryResearchID);

    //IridiumDrillbitFactoryID
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      IridiumDrillbitFactoryID,
      TungstenRodsCraftedItemID,
      50,
      LaserPowerSourceCraftedItemID,
      5
    );

    requiredResearch.set(IridiumDrillbitFactoryID, IridiumDrillbitFactoryResearchID);

    //PrecisionPneumaticDrillID
    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PrecisionPneumaticDrillID,
      TungstenResourceItemID,
      100,
      OsmiumResourceItemID,
      100,
      LaserPowerSourceCraftedItemID,
      5
    );
    requiredResearch.set(PrecisionPneumaticDrillID, PrecisionPneumaticDrillResearchID);

    //PenetratorFactoryID
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratorFactoryID,
      OsmiumResourceItemID,
      200,
      IronPlateCraftedItemID,
      50,
      AdvancedPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(PenetratorFactoryID, PenetratorFactoryResearchID);

    //PenetratingMissileFactoryID
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      PenetratingMissileFactoryID,
      OsmiumResourceItemID,
      300,
      TitaniumResourceItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      15
    );
    requiredResearch.set(PenetratingMissileFactoryID, PenetratingMissileFactoryResearchID);

    //MissileLaunchComplexID
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      MissileLaunchComplexID,
      TungstenRodsCraftedItemID,
      100,
      OsmiumResourceItemID,
      100
    );
    requiredResearch.set(MissileLaunchComplexID, MissileLaunchComplexResearchID);

    //HighEnergyLaserFactoryID
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      HighEnergyLaserFactoryID,
      IridiumCrystalCraftedItemID,
      50,
      RefinedOsmiumCraftedItemID,
      100,
      AdvancedPowerSourceCraftedItemID,
      50
    );
    requiredResearch.set(HighEnergyLaserFactoryID, HighEnergyLaserFactoryResearchID);

    //ThermobaricWarheadFactory
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ThermobaricWarheadFactoryID,
      RefinedOsmiumCraftedItemID,
      200,
      IridiumCrystalCraftedItemID,
      100,
      LaserPowerSourceCraftedItemID,
      10
    );
    requiredResearch.set(ThermobaricWarheadFactoryID, ThermobaricWarheadFactoryResearchID);

    //ThermobaricMissileFactoryID
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set3RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      ThermobaricMissileFactoryID,
      IridiumCrystalCraftedItemID,
      100,
      TungstenRodsCraftedItemID,
      100,
      LaserPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);

    //KimberliteCatalystFactoryID
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    LibSetRequiredResources.set2RequiredResourcesForEntity(
      requiredResources,
      itemComponent,
      KimberliteCatalystFactoryID,
      IridiumCrystalCraftedItemID,
      200,
      LaserPowerSourceCraftedItemID,
      20
    );
    requiredResearch.set(KimberliteCatalystFactoryID, KimberliteCatalystFactoryResearchID);
  }
}
