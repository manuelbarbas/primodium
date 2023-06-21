// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";
library LibBuildingDesign {

    function setupBuildingDesign(Uint256Component itemComponent, Uint256Component requiredResearch, Uint256ArrayComponent requiredResources)  internal
    {

        
        //BasicMinerId  
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, BasicMinerID),100);
        requiredResources.set(BasicMinerID,[IronResourceItemID]);

        //Node
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, NodeID),50);
        requiredResources.set(NodeID,[IronResourceItemID]);

        //PlatingFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, PlatingFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, PlatingFactoryID),50);
        requiredResources.set(PlatingFactoryID,[IronResourceItemID,CopperResourceItemID]);
        requiredResearch.set(PlatingFactoryID, PlatingFactoryResearchID);

        //BasicBatteryFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, BasicBatteryFactoryID),20);
        itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, BasicBatteryFactoryID),50);
        requiredResources.set(BasicBatteryFactoryID,[IronPlateCraftedItemID,CopperResourceItemID]);
        requiredResearch.set(BasicBatteryFactoryID, BasicBatteryFactoryResearchID);

        //KineticMissileFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, KineticMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LithiumResourceItemID, KineticMissileFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, KineticMissileFactoryID),10);
        requiredResources.set(KineticMissileFactoryID,[IronPlateCraftedItemID,LithiumResourceItemID,BasicPowerSourceCraftedItemID]);
        requiredResearch.set(KineticMissileFactoryID, KineticMissileFactoryResearchID);

        //ProjectileLauncherID
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, ProjectileLauncherID),100);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, ProjectileLauncherID),100);
        requiredResources.set(ProjectileLauncherID,[IronPlateCraftedItemID,TitaniumResourceItemID]);
        requiredResearch.set(ProjectileLauncherID, ProjectileLauncherResearchID);


        //HardenedDrillID
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, HardenedDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, HardenedDrillID),10);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, HardenedDrillID),5);
        requiredResources.set(HardenedDrillID,[TitaniumResourceItemID,IronPlateCraftedItemID,BasicPowerSourceCraftedItemID]);
        requiredResearch.set(HardenedDrillID, HardenedDrillResearchID);


        //DenseMetalRefineryID
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, DenseMetalRefineryID),50);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, DenseMetalRefineryID),100);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, DenseMetalRefineryID),30);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, DenseMetalRefineryID),10);
        requiredResources.set(DenseMetalRefineryID,[OsmiumResourceItemID,TitaniumResourceItemID,IronPlateCraftedItemID,BasicPowerSourceCraftedItemID]);
        requiredResearch.set(DenseMetalRefineryID, DenseMetalRefineryResearchID);

        //AdvancedBatteryFactoryID
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, AdvancedBatteryFactoryID),150);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, AdvancedBatteryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, AdvancedBatteryFactoryID),20);
        requiredResources.set(AdvancedBatteryFactoryID,[OsmiumResourceItemID,TitaniumResourceItemID,BasicPowerSourceCraftedItemID]);
        requiredResearch.set(AdvancedBatteryFactoryID, AdvancedBatteryFactoryResearchID);

        //HighTempFoundryID
        itemComponent.set(LibEncode.hashFromKey(TungstenResourceItemID, AdvancedBatteryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, AdvancedBatteryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, AdvancedBatteryFactoryID),20);
        requiredResources.set(AdvancedBatteryFactoryID,[OsmiumResourceItemID,TitaniumResourceItemID,BasicPowerSourceCraftedItemID]);
        requiredResearch.set(AdvancedBatteryFactoryID, HighTempFoundryResearchID);

        //PrecisionMachineryFactoryID
        itemComponent.set(LibEncode.hashFromKey(IridiumResourceItemID, PrecisionMachineryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, PrecisionMachineryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PrecisionMachineryFactoryID),10);
        requiredResources.set(PrecisionMachineryFactoryID,[IridiumResourceItemID,TungstenRodsCraftedItemID,AdvancedPowerSourceCraftedItemID]);
        requiredResearch.set(PrecisionMachineryFactoryID, PrecisionMachineryFactoryResearchID);

        //IridiumDrillbitFactoryID
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, IridiumDrillbitFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, IridiumDrillbitFactoryID),5);
        requiredResources.set(IridiumDrillbitFactoryID,[TungstenRodsCraftedItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(IridiumDrillbitFactoryID, IridiumDrillbitFactoryResearchID);


        //PrecisionPneumaticDrillID
        itemComponent.set(LibEncode.hashFromKey(TungstenResourceItemID, PrecisionPneumaticDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PrecisionPneumaticDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, PrecisionPneumaticDrillID),5);
        requiredResources.set(PrecisionPneumaticDrillID,[TungstenResourceItemID,OsmiumResourceItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(PrecisionPneumaticDrillID, PrecisionMachineryFactoryResearchID);

        //PenetratorFactoryID
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PenetratorFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, PenetratorFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PenetratorFactoryID),10);
        requiredResources.set(PenetratorFactoryID,[OsmiumResourceItemID,IronPlateCraftedItemID,AdvancedPowerSourceCraftedItemID]);
        requiredResearch.set(PenetratorFactoryID, PenetratorFactoryResearchID);


        //PenetratingMissileFactoryID
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PenetratingMissileFactoryID),300);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, PenetratingMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PenetratingMissileFactoryID),10);
        requiredResources.set(PenetratingMissileFactoryID,[OsmiumResourceItemID,TitaniumResourceItemID,AdvancedPowerSourceCraftedItemID]);
        requiredResearch.set(PenetratingMissileFactoryID, PenetratingMissileFactoryResearchID);

        //MissileLaunchComplexID
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, MissileLaunchComplexID),100);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, MissileLaunchComplexID),100);
        requiredResources.set(MissileLaunchComplexID,[TungstenRodsCraftedItemID,OsmiumResourceItemID]);
        requiredResearch.set(MissileLaunchComplexID, MissileLaunchComplexResearchID);
        
        //HighEnergyLaserFactoryID
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, HighEnergyLaserFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, HighEnergyLaserFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, HighEnergyLaserFactoryID),50);
        requiredResources.set(HighEnergyLaserFactoryID,[IridiumCrystalCraftedItemID,RefinedOsmiumCraftedItemID,AdvancedPowerSourceCraftedItemID]);
        requiredResearch.set(HighEnergyLaserFactoryID, PenetratingMissileFactoryResearchID);

        //ThermobaricWarheadFactory
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, HighEnergyLaserFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, HighEnergyLaserFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, HighEnergyLaserFactoryID),10);
        requiredResources.set(HighEnergyLaserFactoryID,[RefinedOsmiumCraftedItemID,IridiumCrystalCraftedItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(HighEnergyLaserFactoryID, ThermobaricWarheadFactoryResearchID);
        
        //ThermobaricMissileFactoryID
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, ThermobaricMissileFactoryID),20);
        requiredResources.set(ThermobaricMissileFactoryID,[IridiumCrystalCraftedItemID,TungstenRodsCraftedItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);

        //ThermobaricMissileFactoryID
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, ThermobaricMissileFactoryID),20);
        requiredResources.set(ThermobaricMissileFactoryID,[IridiumCrystalCraftedItemID,TungstenRodsCraftedItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);
        

        //KimberliteCatalystFactoryID
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, KimberliteCatalystFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, KimberliteCatalystFactoryID),20);
        requiredResources.set(KimberliteCatalystFactoryID,[IridiumCrystalCraftedItemID,LaserPowerSourceCraftedItemID]);
        requiredResearch.set(KimberliteCatalystFactoryID, KimberliteCatalystFactoryResearchID);
        


    }
    // Build Node with 50 IronResource
    
    // Build PlatingFactory with 100 IronResource and 50 CopperResource

    // Build BasicBatteryFactory with 20 IronPlateCrafted and 50 CopperResource
    // Build KineticMissileFactory with 100 IronPlateCrafted 50 LithiumResource and 10 BasicPowerSourceCrafted

    // Build ProjectileLauncher with 100 IronPlateCrafted and 100 TitaniumResource
    
    // Build HardenedDrill with 100 TitaniumResource 10 IronPlateCrafted 5 BasicPowerSourceCrafted
    
    // Build DenseMetalRefinery with 50 OsmiumResource 100 TitaniumResource 30 IronPlateCrafted 10 BasicPowerSourceCrafted
    
    // Build AdvancedBatteryFactory with 150 OsmiumResource 50 TitaniumResource and 20 BasicPowerSourceCrafted
    
    // Build HighTempFoundry with 50 TungstenResource 50 RefinedOsmium and 20 AdvancedPowerSourceCrafted
    
    // Build PrecisionMachineryFactory with 50 IridiumResource 50 TungstenRodsCrafted and 10 AdvancedPowerSourceCrafted
    
    // Build IridiumDrillbitFactory with 50 TungstenRodsCrafted and 5 LaserPowerSourceCrafted

    // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
   
    // Build PenetratorFactory with 200 OsmiumResource 50 IronPlateCrafted and 10 AdvancedPowerSourceCrafted
   
    // Build PenetratingMissileFactory with 300 OsmiumResource 100 TitaniumResource and 15 AdvancedPowerSourceCrafted
    
    // Build MissileLaunchComplex with 100 TungstenRodsCrafted and 100 OsmiumResource
    
    // Build HighEnergyLaserFactory with 50 IridiumCrystalCrafted 100 RefinedOsmiumCrafted and 50 AdvancedPowerSourceCrafted
    
    // Build ThermobaricWarheadFactory with 200 RefinedOsmiumCrafted 100 IridiumCrystalCrafted and 10 LaserPowerSourceCrafted
    
    // Build ThermobaricMissileFactory with 100 IridiumCrystalCrafted 100 TungstenRodsCrafted and 20 LaserPowerSourceCrafted
   
    // Build KimberliteCatalystFactory with 200 IridiumCrystalCrafted and 20 LaserPowerSourceCrafted
    

    

  
}
