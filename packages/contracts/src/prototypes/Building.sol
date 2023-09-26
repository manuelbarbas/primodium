// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// Building key
// todo: move to a separate file
string constant BuildingKey = "building";
string constant BuildingTileKey = "building.tile";
string constant AsteroidKey = "asteroid";
string constant TerrainKey = "terrain";

// buildings
uint256 constant MainBaseID = uint256(keccak256("block.MainBase"));
uint256 constant StarMapID = uint256(keccak256("block.StarMap"));

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
uint256 constant SulfurMineID = uint256(keccak256("block.SulfurMine"));

//Resource Capacity Blocks
uint256 constant SolarPanelID = uint256(keccak256("block.SolarPanel"));
uint256 constant HangarID = uint256(keccak256("block.Hangar"));
uint256 constant GarageID = uint256(keccak256("block.Garage"));

// Factory Blocks
uint256 constant IronPlateFactoryID = uint256(keccak256("block.IronPlateFactory"));
uint256 constant AlloyFactoryID = uint256(keccak256("block.AlloyFactory"));
uint256 constant PhotovoltaicCellFactoryID = uint256(keccak256("block.PhotovoltaicCellFactory"));
uint256 constant SpaceFuelFactoryID = uint256(keccak256("block.SpaceFuelFactory"));

//Storage Unit
uint256 constant StorageUnitID = uint256(keccak256("block.StorageUnit"));

// Units
uint256 constant DroneFactoryID = uint256(keccak256("block.DroneFactory"));
uint256 constant AdvancedDroneFactoryID = uint256(keccak256("block.AdvancedDroneFactory"));

// Starmapper
uint256 constant StarmapperID = uint256(keccak256("block.Starmapper"));

// DefenciveBuildings
uint256 constant SAMMissilesID = uint256(keccak256("block.SAMMissiles"));
