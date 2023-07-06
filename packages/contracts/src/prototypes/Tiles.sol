// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Terrain blocks
uint256 constant WaterID = uint256(keccak256("block.Water"));
uint256 constant AirID = uint256(keccak256("block.Air"));

uint256 constant SandstoneID = uint256(keccak256("block.Sandstone"));
uint256 constant BiofilmID = uint256(keccak256("block.Biofilm"));
uint256 constant AlluviumID = uint256(keccak256("block.Alluvium"));
uint256 constant RegolithID = uint256(keccak256("block.Regolith"));
uint256 constant BedrockID = uint256(keccak256("block.Bedrock"));

// Resource blocks: matching with research and item IDs
uint256 constant LithiumID = uint256(keccak256("block.Lithium"));
uint256 constant IronID = uint256(keccak256("block.Iron"));
uint256 constant CopperID = uint256(keccak256("block.Copper"));
uint256 constant TitaniumID = uint256(keccak256("block.Titanium"));
uint256 constant IridiumID = uint256(keccak256("block.Iridium"));
uint256 constant OsmiumID = uint256(keccak256("block.Osmium"));
uint256 constant TungstenID = uint256(keccak256("block.Tungsten"));
uint256 constant KimberliteID = uint256(keccak256("block.Kimberlite"));
uint256 constant UraniniteID = uint256(keccak256("block.Uraninite"));
uint256 constant BolutiteID = uint256(keccak256("block.Bolutite"));

// buildings
uint256 constant MainBaseID = uint256(keccak256("building.MainBase"));
uint256 constant BasicMinerID = uint256(keccak256("building.BasicMiner"));
uint256 constant NodeID = uint256(keccak256("building.Node"));
uint256 constant PlatingFactoryID = uint256(keccak256("building.PlatingFactory"));
uint256 constant BasicBatteryFactoryID = uint256(keccak256("building.BasicBatteryFactory"));
uint256 constant KineticMissileFactoryID = uint256(keccak256("building.KineticMissileFactory"));
uint256 constant ProjectileLauncherID = uint256(keccak256("building.ProjectileLauncher"));
uint256 constant HardenedDrillID = uint256(keccak256("building.HardenedDrill"));
uint256 constant DenseMetalRefineryID = uint256(keccak256("building.DenseMetalRefinery"));
uint256 constant AdvancedBatteryFactoryID = uint256(keccak256("building.AdvancedBatteryFactory"));
uint256 constant HighTempFoundryID = uint256(keccak256("building.HighTempFoundry"));
uint256 constant PrecisionMachineryFactoryID = uint256(keccak256("building.PrecisionMachineryFactory"));
uint256 constant IridiumDrillbitFactoryID = uint256(keccak256("building.IridiumDrillbitFactory"));
uint256 constant PrecisionPneumaticDrillID = uint256(keccak256("building.PrecisionPneumaticDrill"));
uint256 constant PenetratorFactoryID = uint256(keccak256("building.PenetratorFactory"));
uint256 constant PenetratingMissileFactoryID = uint256(keccak256("building.PenetratingMissileFactory"));
uint256 constant MissileLaunchComplexID = uint256(keccak256("building.MissileLaunchComplex"));
uint256 constant HighEnergyLaserFactoryID = uint256(keccak256("building.HighEnergyLaserFactory"));
uint256 constant ThermobaricWarheadFactoryID = uint256(keccak256("building.ThermobaricWarheadFactory"));
uint256 constant ThermobaricMissileFactoryID = uint256(keccak256("building.ThermobaricMissileFactory"));
uint256 constant KimberliteCatalystFactoryID = uint256(keccak256("building.KimberliteCatalystFactory"));

// debug buildings
uint256 constant DebugNodeID = uint256(keccak256("debug.DebugNode"));
uint256 constant MinerID = uint256(keccak256("debug.Miner"));
uint256 constant LithiumMinerID = uint256(keccak256("debug.LithiumMiner"));
uint256 constant BulletFactoryID = uint256(keccak256("debug.BulletFactory"));
uint256 constant DebugPlatingFactoryID = uint256(keccak256("debug.DebugPlatingFactory"));
uint256 constant SiloID = uint256(keccak256("debug.Silo"));
