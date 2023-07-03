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

// Special blocks
uint256 constant MainBaseID = uint256(keccak256("block.MainBase"));

// Mine Blocks
uint256 constant LithiumMineID = uint256(keccak256("block.LithiumMine"));
uint256 constant IronMineID = uint256(keccak256("block.IronMine"));
uint256 constant CopperMineID = uint256(keccak256("block.CopperMine"));
uint256 constant TitaniumMineID = uint256(keccak256("block.TitaniumMine"));
uint256 constant IridiumMineID = uint256(keccak256("block.IridiumMine"));
uint256 constant OsmiumMineID = uint256(keccak256("block.OsmiumMine"));
uint256 constant TungstenMineID = uint256(keccak256("block.TungstenMine"));
uint256 constant KimberliteMineID = uint256(keccak256("block.KimberliteMine"));
uint256 constant UraniniteMineID = uint256(keccak256("block.UraniniteMine"));
uint256 constant BolutiteMineID = uint256(keccak256("block.BolutiteMine"));

uint256 constant MinerID = uint256(keccak256("block.Miner"));
uint256 constant LithiumMinerID = uint256(keccak256("block.LithiumMiner"));

uint256 constant BulletFactoryID = uint256(keccak256("block.BulletFactory"));
uint256 constant SiloID = uint256(keccak256("block.Silo"));
uint256 constant DebugPlatingFactoryID = uint256(keccak256("block.DebugPlatingFactory"));

// in-game blocks/factories
uint256 constant BasicMinerID = uint256(keccak256("block.BasicMiner"));
uint256 constant NodeID = uint256(keccak256("block.Node"));
uint256 constant PlatingFactoryID = uint256(keccak256("block.PlatingFactory"));
uint256 constant BasicBatteryFactoryID = uint256(keccak256("block.BasicBatteryFactory"));
uint256 constant KineticMissileFactoryID = uint256(keccak256("block.KineticMissileFactory"));
uint256 constant ProjectileLauncherID = uint256(keccak256("block.ProjectileLauncher"));
uint256 constant HardenedDrillID = uint256(keccak256("block.HardenedDrill"));
uint256 constant DenseMetalRefineryID = uint256(keccak256("block.DenseMetalRefinery"));
uint256 constant AdvancedBatteryFactoryID = uint256(keccak256("block.AdvancedBatteryFactory"));
uint256 constant HighTempFoundryID = uint256(keccak256("block.HighTempFoundry"));
uint256 constant PrecisionMachineryFactoryID = uint256(keccak256("block.PrecisionMachineryFactory"));
uint256 constant IridiumDrillbitFactoryID = uint256(keccak256("block.IridiumDrillbitFactory"));
uint256 constant PrecisionPneumaticDrillID = uint256(keccak256("block.PrecisionPneumaticDrill"));
uint256 constant PenetratorFactoryID = uint256(keccak256("block.PenetratorFactory"));
uint256 constant PenetratingMissileFactoryID = uint256(keccak256("block.PenetratingMissileFactory"));
uint256 constant MissileLaunchComplexID = uint256(keccak256("block.MissileLaunchComplex"));
uint256 constant HighEnergyLaserFactoryID = uint256(keccak256("block.HighEnergyLaserFactory"));
uint256 constant ThermobaricWarheadFactoryID = uint256(keccak256("block.ThermobaricWarheadFactory"));
uint256 constant ThermobaricMissileFactoryID = uint256(keccak256("block.ThermobaricMissileFactory"));
uint256 constant KimberliteCatalystFactoryID = uint256(keccak256("block.KimberliteCatalystFactory"));
