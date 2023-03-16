// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

// Terrain blocks
uint256 constant WaterID = uint256(keccak256("block.Water"));
uint256 constant AirID = uint256(keccak256("block.Air"));

uint256 constant SandstoneID = uint256(keccak256("block.Sandstone"));
uint256 constant BiofilmID = uint256(keccak256("block.Biofilm"));
uint256 constant AlluviumID = uint256(keccak256("block.Alluvium"));
uint256 constant RegolithID = uint256(keccak256("block.Regolith"));
uint256 constant BedrockID = uint256(keccak256("block.Bedrock"));

// Resource blocks
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
uint256 constant ConveyerID = uint256(keccak256("block.Conveyer"));

uint256 constant MinerID = uint256(keccak256("block.Miner"));
uint256 constant LithiumMinerID = uint256(keccak256("block.LithiumMiner"));

uint256 constant BulletFactoryID = uint256(keccak256("block.BulletFactory"));
uint256 constant SiloID = uint256(keccak256("block.Silo"));
