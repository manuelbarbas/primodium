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

import { MainBaseID, SiloID, BulletFactoryID, DebugPlatingFactoryID } from "../prototypes/Tiles.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

// production buildings
import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

// Items
import { BolutiteResourceItemID, CopperResourceItemID, IridiumResourceItemID, IronResourceItemID, KimberliteResourceItemID, LithiumResourceItemID, OsmiumResourceItemID, TitaniumResourceItemID, TungstenResourceItemID, UraniniteResourceItemID, IronPlateCraftedItemID, BasicPowerSourceCraftedItemID, KineticMissileCraftedItemID, RefinedOsmiumCraftedItemID, AdvancedPowerSourceCraftedItemID, PenetratingWarheadCraftedItemID, PenetratingMissileCraftedItemID, TungstenRodsCraftedItemID, IridiumCrystalCraftedItemID, IridiumDrillbitCraftedItemID, LaserPowerSourceCraftedItemID, ThermobaricWarheadCraftedItemID, ThermobaricMissileCraftedItemID, KimberliteCrystalCatalystCraftedItemID, BulletCraftedItemID } from "../prototypes/Keys.sol";

// Research
import { CopperResearchID, LithiumResearchID, TitaniumResearchID, OsmiumResearchID, TungstenResearchID, IridiumResearchID, KimberliteResearchID, PlatingFactoryResearchID, BasicBatteryFactoryResearchID, KineticMissileFactoryResearchID, ProjectileLauncherResearchID, HardenedDrillResearchID, DenseMetalRefineryResearchID, AdvancedBatteryFactoryResearchID, HighTempFoundryResearchID, PrecisionMachineryFactoryResearchID, IridiumDrillbitFactoryResearchID, PrecisionPneumaticDrillResearchID, PenetratorFactoryResearchID, PenetratingMissileFactoryResearchID, MissileLaunchComplexResearchID, HighEnergyLaserFactoryResearchID, ThermobaricWarheadFactoryResearchID, ThermobaricMissileFactoryResearchID, KimberliteCatalystFactoryResearchID, FastMinerResearchID } from "../prototypes/Keys.sol";
library LibBuildingDesignInitializer {

    function init(IWorld world) internal
    {
        IUint256Component components = world.components();
        ItemComponent itemComponent = ItemComponent(getAddressById(components,ItemComponentID));
        RequiredResearchComponent requiredResearch = RequiredResearchComponent(getAddressById(components,RequiredResearchComponentID));
        RequiredResourcesComponent requiredResources =  RequiredResourcesComponent(getAddressById(components,RequiredResourcesComponentID));

        //BasicMinerId  
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, BasicMinerID),100);
        
        uint256[] memory requiredResourceIDs = new uint256[](1);
        requiredResourceIDs[0] = IronResourceItemID;
        requiredResources.set(BasicMinerID,requiredResourceIDs);

        //Node
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, NodeID),50);
        requiredResourceIDs = new uint256[](1);
        requiredResourceIDs[0] = IronResourceItemID;
        requiredResources.set(NodeID,requiredResourceIDs);

        //PlatingFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, PlatingFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, PlatingFactoryID),50);
        
        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[0] = IronResourceItemID;
        requiredResourceIDs[1] = CopperResourceItemID;
        requiredResources.set(PlatingFactoryID,requiredResourceIDs);
        
        requiredResearch.set(PlatingFactoryID, PlatingFactoryResearchID);

        //BasicBatteryFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronResourceItemID, BasicBatteryFactoryID),20);
        itemComponent.set(LibEncode.hashFromKey(CopperResourceItemID, BasicBatteryFactoryID),50);
        
        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[0] = IronResourceItemID;
        requiredResourceIDs[1] = CopperResourceItemID;
        requiredResources.set(BasicBatteryFactoryID,requiredResourceIDs);
        
        requiredResearch.set(BasicBatteryFactoryID, BasicBatteryFactoryResearchID);

        //KineticMissileFactoryID
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, KineticMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LithiumResourceItemID, KineticMissileFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, KineticMissileFactoryID),10);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[0] = IronPlateCraftedItemID;
        requiredResourceIDs[1] = LithiumResourceItemID;
        requiredResourceIDs[2] = BasicPowerSourceCraftedItemID;
        requiredResources.set(KineticMissileFactoryID,requiredResourceIDs);
        
        requiredResearch.set(KineticMissileFactoryID, KineticMissileFactoryResearchID);

        

        //ProjectileLauncherID
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, ProjectileLauncherID),100);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, ProjectileLauncherID),100);
        
        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[0] = IronPlateCraftedItemID;
        requiredResourceIDs[1] = TitaniumResourceItemID;
        requiredResources.set(ProjectileLauncherID,requiredResourceIDs);
        
        requiredResearch.set(ProjectileLauncherID, ProjectileLauncherResearchID);


        //HardenedDrillID
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, HardenedDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, HardenedDrillID),10);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, HardenedDrillID),5);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[0] = TitaniumResourceItemID;
        requiredResourceIDs[1] = IronPlateCraftedItemID;
        requiredResourceIDs[2] = BasicPowerSourceCraftedItemID;
        requiredResources.set(HardenedDrillID,requiredResourceIDs);
        
        requiredResearch.set(HardenedDrillID, HardenedDrillResearchID);


        //DenseMetalRefineryID
        
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, DenseMetalRefineryID),50);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, DenseMetalRefineryID),100);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, DenseMetalRefineryID),30);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, DenseMetalRefineryID),10);
        
        requiredResourceIDs = new uint256[](4);
        requiredResourceIDs[0] = OsmiumResourceItemID;
        requiredResourceIDs[1] = TitaniumResourceItemID;
        requiredResourceIDs[2] = IronPlateCraftedItemID;
        requiredResourceIDs[3] = BasicPowerSourceCraftedItemID;
        requiredResources.set(DenseMetalRefineryID,requiredResourceIDs);
        
        requiredResearch.set(DenseMetalRefineryID, DenseMetalRefineryResearchID);

        //AdvancedBatteryFactoryID
        
        
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, AdvancedBatteryFactoryID),150);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, AdvancedBatteryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(BasicPowerSourceCraftedItemID, AdvancedBatteryFactoryID),20);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[0] = OsmiumResourceItemID;
        requiredResourceIDs[1] = TitaniumResourceItemID;
        requiredResourceIDs[2] = BasicPowerSourceCraftedItemID;
        requiredResources.set(AdvancedBatteryFactoryID,requiredResourceIDs);

        requiredResearch.set(AdvancedBatteryFactoryID, AdvancedBatteryFactoryResearchID);

        //HighTempFoundryID
        
        
        itemComponent.set(LibEncode.hashFromKey(TungstenResourceItemID, HighTempFoundryID),50);
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, HighTempFoundryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, HighTempFoundryID),20);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[0] = TungstenResourceItemID;
        requiredResourceIDs[1] = RefinedOsmiumCraftedItemID;
        requiredResourceIDs[2] = AdvancedPowerSourceCraftedItemID;
        requiredResources.set(HighTempFoundryID,requiredResourceIDs);
        
        requiredResearch.set(HighTempFoundryID, HighTempFoundryResearchID);

        //PrecisionMachineryFactoryID
        
        itemComponent.set(LibEncode.hashFromKey(IridiumResourceItemID, PrecisionMachineryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, PrecisionMachineryFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PrecisionMachineryFactoryID),10);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[0] = IridiumResourceItemID;
        requiredResourceIDs[1] = TungstenRodsCraftedItemID;
        requiredResourceIDs[2] = AdvancedPowerSourceCraftedItemID;
        requiredResources.set(PrecisionMachineryFactoryID,requiredResourceIDs);
        
        requiredResearch.set(PrecisionMachineryFactoryID, PrecisionMachineryFactoryResearchID);

        //IridiumDrillbitFactoryID
        
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, IridiumDrillbitFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, IridiumDrillbitFactoryID),5);

        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[0] = TungstenRodsCraftedItemID;
        requiredResourceIDs[1] = LaserPowerSourceCraftedItemID;
        requiredResources.set(IridiumDrillbitFactoryID,requiredResourceIDs);

        requiredResearch.set(IridiumDrillbitFactoryID, IridiumDrillbitFactoryResearchID);


        //PrecisionPneumaticDrillID
        // Build PrecisionPneumaticDrill with 100 TungstenResource 100 OsmiumResource and 5 LaserPowerSourceCrafted
        itemComponent.set(LibEncode.hashFromKey(TungstenResourceItemID, PrecisionPneumaticDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PrecisionPneumaticDrillID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, PrecisionPneumaticDrillID),5);
        
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = TungstenResourceItemID;
        requiredResourceIDs[0] = OsmiumResourceItemID;
        requiredResourceIDs[2] = LaserPowerSourceCraftedItemID;
        requiredResources.set(PrecisionPneumaticDrillID,requiredResourceIDs);

        requiredResearch.set(PrecisionPneumaticDrillID, PrecisionMachineryFactoryResearchID);

        //PenetratorFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PenetratorFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(IronPlateCraftedItemID, PenetratorFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PenetratorFactoryID),10);
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = OsmiumResourceItemID;
        requiredResourceIDs[0] = IronPlateCraftedItemID;
        requiredResourceIDs[2] = AdvancedPowerSourceCraftedItemID;
        
        requiredResources.set(PenetratorFactoryID,requiredResourceIDs);
        requiredResearch.set(PenetratorFactoryID, PenetratorFactoryResearchID);


        //PenetratingMissileFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, PenetratingMissileFactoryID),300);
        itemComponent.set(LibEncode.hashFromKey(TitaniumResourceItemID, PenetratingMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, PenetratingMissileFactoryID),10);
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = OsmiumResourceItemID;
        requiredResourceIDs[0] = TitaniumResourceItemID;
        requiredResourceIDs[2] = AdvancedPowerSourceCraftedItemID;
        requiredResources.set(PenetratingMissileFactoryID,requiredResourceIDs);
        requiredResearch.set(PenetratingMissileFactoryID, PenetratingMissileFactoryResearchID);

        //MissileLaunchComplexID
        requiredResourceIDs = new uint256[](2);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, MissileLaunchComplexID),100);
        itemComponent.set(LibEncode.hashFromKey(OsmiumResourceItemID, MissileLaunchComplexID),100);
        
        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[1] = TungstenRodsCraftedItemID;
        requiredResourceIDs[0] = OsmiumResourceItemID;
        requiredResources.set(MissileLaunchComplexID,requiredResourceIDs);
        requiredResearch.set(MissileLaunchComplexID, MissileLaunchComplexResearchID);
        
        //HighEnergyLaserFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, HighEnergyLaserFactoryID),50);
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, HighEnergyLaserFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(AdvancedPowerSourceCraftedItemID, HighEnergyLaserFactoryID),50);

        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = IridiumCrystalCraftedItemID;
        requiredResourceIDs[0] = RefinedOsmiumCraftedItemID;
        requiredResourceIDs[2] = AdvancedPowerSourceCraftedItemID;
        requiredResources.set(HighEnergyLaserFactoryID,requiredResourceIDs);
        requiredResearch.set(HighEnergyLaserFactoryID, PenetratingMissileFactoryResearchID);

        //ThermobaricWarheadFactory
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(RefinedOsmiumCraftedItemID, ThermobaricWarheadFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, ThermobaricWarheadFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, ThermobaricWarheadFactoryID),10);

        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = RefinedOsmiumCraftedItemID;
        requiredResourceIDs[0] = IridiumCrystalCraftedItemID;
        requiredResourceIDs[2] = LaserPowerSourceCraftedItemID;
        requiredResources.set(ThermobaricWarheadFactoryID,requiredResourceIDs);
        requiredResearch.set(ThermobaricWarheadFactoryID, ThermobaricWarheadFactoryResearchID);
        
        //ThermobaricMissileFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, ThermobaricMissileFactoryID),20);

        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = IridiumCrystalCraftedItemID;
        requiredResourceIDs[0] = TungstenRodsCraftedItemID;
        requiredResourceIDs[2] = LaserPowerSourceCraftedItemID;
        requiredResources.set(ThermobaricMissileFactoryID,requiredResourceIDs);
        requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);

        //ThermobaricMissileFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(TungstenRodsCraftedItemID, ThermobaricMissileFactoryID),100);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, ThermobaricMissileFactoryID),20);
        requiredResourceIDs = new uint256[](3);
        requiredResourceIDs[1] = IridiumCrystalCraftedItemID;
        requiredResourceIDs[0] = TungstenRodsCraftedItemID;
        requiredResourceIDs[2] = LaserPowerSourceCraftedItemID;
        requiredResources.set(ThermobaricMissileFactoryID,requiredResourceIDs);
        requiredResearch.set(ThermobaricMissileFactoryID, ThermobaricMissileFactoryResearchID);
        

        //KimberliteCatalystFactoryID
        requiredResourceIDs = new uint256[](3);
        itemComponent.set(LibEncode.hashFromKey(IridiumCrystalCraftedItemID, KimberliteCatalystFactoryID),200);
        itemComponent.set(LibEncode.hashFromKey(LaserPowerSourceCraftedItemID, KimberliteCatalystFactoryID),20);
        requiredResourceIDs = new uint256[](2);
        requiredResourceIDs[1] = IridiumCrystalCraftedItemID;
        requiredResourceIDs[0] = LaserPowerSourceCraftedItemID;
        requiredResources.set(KimberliteCatalystFactoryID,requiredResourceIDs);
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
