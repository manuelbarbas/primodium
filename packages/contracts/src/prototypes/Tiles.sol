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

// Factory Blocks
uint256 constant IronPlateFactoryID = uint256(keccak256("block.IronPlateFactory"));

//Storage Unit
uint256 constant StorageUnitID = uint256(keccak256("block.StorageUnit"));
