// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Tiles.sol";

// Item IDs
uint256 constant BolutiteResourceItemID = BolutiteID;
uint256 constant CopperResourceItemID = CopperID;
uint256 constant IridiumResourceItemID = IridiumID;
uint256 constant IronResourceItemID = IronID;
uint256 constant KimberliteResourceItemID = KimberliteID;
uint256 constant LithiumResourceItemID = LithiumID;
uint256 constant OsmiumResourceItemID = OsmiumID;
uint256 constant TitaniumResourceItemID = TitaniumID;
uint256 constant TungstenResourceItemID = TungstenID;
uint256 constant UraniniteResourceItemID = UraniniteID;

uint256 constant IronPlateCraftedItemID = uint256(keccak256("item.IronPlateCrafted"));
uint256 constant BasicPowerSourceCraftedItemID = uint256(keccak256("item.BasicPowerSourceCrafted"));
uint256 constant KineticMissileCraftedItemID = uint256(keccak256("item.KineticMissileCrafted"));
uint256 constant RefinedOsmiumCraftedItemID = uint256(keccak256("item.RefinedOsmiumCrafted"));
uint256 constant AdvancedPowerSourceCraftedItemID = uint256(keccak256("item.AdvancedPowerSourceCrafted"));
uint256 constant PenetratingWarheadCraftedItemID = uint256(keccak256("item.PenetratingWarheadCrafted"));
uint256 constant PenetratingMissileCraftedItemID = uint256(keccak256("item.PenetratingMissileCrafted"));
uint256 constant TungstenRodsCraftedItemID = uint256(keccak256("item.TungstenRodsCrafted"));
uint256 constant IridiumCrystalCraftedItemID = uint256(keccak256("item.IridiumCrystalCrafted"));
uint256 constant IridiumDrillbitCraftedItemID = uint256(keccak256("item.IridiumDrillbitCrafted"));
uint256 constant LaserPowerSourceCraftedItemID = uint256(keccak256("item.LaserPowerSourceCrafted"));
uint256 constant ThermobaricWarheadCraftedItemID = uint256(keccak256("item.ThermobaricWarheadCrafted"));
uint256 constant ThermobaricMissileCraftedItemID = uint256(keccak256("item.ThermobaricMissileCrafted"));
uint256 constant KimberliteCrystalCatalystCraftedItemID = uint256(keccak256("item.KimberliteCrystalCatalystCrafted"));

// Debug Item IDs
uint256 constant BulletCraftedItemID = uint256(keccak256("item.BulletCrafted"));

// Research IDs, match up with Tiles and Item IDs
uint256 constant CopperResearchID = CopperID;
uint256 constant LithiumResearchID = LithiumID;
uint256 constant TitaniumResearchID = TitaniumID;
uint256 constant OsmiumResearchID = OsmiumID;
uint256 constant TungstenResearchID = TungstenID;
uint256 constant IridiumResearchID = IridiumID;
uint256 constant KimberliteResearchID = KimberliteID;
uint256 constant UraniniteResearchID = UraniniteID;
uint256 constant BolutiteResearchID = BolutiteID;

uint256 constant PlatingFactoryResearchID = uint256(keccak256("research.PlatingFactory"));
uint256 constant BasicBatteryFactoryResearchID = uint256(keccak256("research.BasicBatteryFactory"));
uint256 constant KineticMissileFactoryResearchID = uint256(keccak256("research.KineticMissileFactory"));
uint256 constant ProjectileLauncherResearchID = uint256(keccak256("research.ProjectileLauncher"));
uint256 constant HardenedDrillResearchID = uint256(keccak256("research.HardenedDrill"));
uint256 constant DenseMetalRefineryResearchID = uint256(keccak256("research.DenseMetalRefinery"));
uint256 constant AdvancedBatteryFactoryResearchID = uint256(keccak256("research.AdvancedBatteryFactory"));
uint256 constant HighTempFoundryResearchID = uint256(keccak256("research.HighTempFoundry"));
uint256 constant PrecisionMachineryFactoryResearchID = uint256(keccak256("research.PrecisionMachineryFactory"));
uint256 constant IridiumDrillbitFactoryResearchID = uint256(keccak256("research.IridiumDrillbitFactory"));
uint256 constant PrecisionPneumaticDrillResearchID = uint256(keccak256("research.PrecisionPneumaticDrill"));
uint256 constant PenetratorFactoryResearchID = uint256(keccak256("research.PenetratorFactory"));
uint256 constant PenetratingMissileFactoryResearchID = uint256(keccak256("research.PenetratingMissileFactory"));
uint256 constant MissileLaunchComplexResearchID = uint256(keccak256("research.MissileLaunchComplex"));
uint256 constant HighEnergyLaserFactoryResearchID = uint256(keccak256("research.HighEnergyLaserFactory"));
uint256 constant ThermobaricWarheadFactoryResearchID = uint256(keccak256("research.ThermobaricWarheadFactory"));
uint256 constant ThermobaricMissileFactoryResearchID = uint256(keccak256("research.ThermobaricMissileFactory"));
uint256 constant KimberliteCatalystFactoryResearchID = uint256(keccak256("research.KimberliteCatalystFactory"));

// Debug Research IDs
uint256 constant FastMinerResearchID = uint256(keccak256("research.FastMiner"));

// Building key
string constant BuildingKey = "building";
string constant BlockKey = "block";
