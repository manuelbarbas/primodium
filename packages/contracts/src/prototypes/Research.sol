// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { LibEncode } from "libraries/LibEncode.sol";
import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Resource.sol";

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

uint256 constant IronMine2ResearchID = uint256(keccak256("research.IronMine2"));
uint256 constant IronMine3ResearchID = uint256(keccak256("research.IronMine3"));
uint256 constant IronMine4ResearchID = uint256(keccak256("research.IronMine4"));

uint256 constant CopperMineResearchID = uint256(keccak256("research.CopperMine"));
uint256 constant CopperMine2ResearchID = uint256(keccak256("research.CopperMine2"));
uint256 constant CopperMine3ResearchID = uint256(keccak256("research.CopperMine3"));

uint256 constant StorageUnitResearchID = uint256(keccak256("research.StorageUnit"));
uint256 constant StorageUnit2ResearchID = uint256(keccak256("research.StorageUnit2"));
uint256 constant StorageUnit3ResearchID = uint256(keccak256("research.StorageUnit3"));

uint256 constant IronPlateFactoryResearchID = uint256(keccak256("research.IronPlateFactory"));
uint256 constant IronPlateFactory2ResearchID = uint256(keccak256("research.IronPlateFactory2"));
uint256 constant IronPlateFactory3ResearchID = uint256(keccak256("research.IronPlateFactory3"));

uint256 constant LithiumMineResearchID = uint256(keccak256("research.LithiumMine"));
uint256 constant LithiumMine2ResearchID = uint256(keccak256("research.LithiumMine2"));
uint256 constant LithiumMine3ResearchID = uint256(keccak256("research.LithiumMine3"));

uint256 constant AlloyFactoryResearchID = uint256(keccak256("research.AlloyFactory"));
uint256 constant AlloyFactory2ResearchID = uint256(keccak256("research.AlloyFactory2"));
uint256 constant AlloyFactory3ResearchID = uint256(keccak256("research.AlloyFactory3"));

uint256 constant LithiumCopperOxideFactoryResearchID = uint256(keccak256("research.PhotovoltaicCellFactory"));
uint256 constant LithiumCopperOxideFactory2ResearchID = uint256(keccak256("research.LithiumCopperOxideFactory2"));
uint256 constant LithiumCopperOxideFactory3ResearchID = uint256(keccak256("research.LithiumCopperOxideFactory3"));

uint256 constant SpaceFuelFactoryResearchID = uint256(keccak256("research.SpaceFuelFactory"));
uint256 constant SpaceFuelFactory2ResearchID = uint256(keccak256("research.SpaceFuelFactory2"));
uint256 constant SpaceFuelFactory3ResearchID = uint256(keccak256("research.SpaceFuelFactory3"));

uint256 constant SolarPanelResearchID = uint256(keccak256("research.SolarPanel"));
uint256 constant SolarPanel2ResearchID = uint256(keccak256("research.SolarPanel2"));
uint256 constant SolarPanel3ResearchID = uint256(keccak256("research.SolarPanel3"));

uint256 constant HousingUnitResearchID = uint256(keccak256("research.HousingUnit"));
uint256 constant HousingUnit2ResearchID = uint256(keccak256("research.HousingUnit2"));
uint256 constant HousingUnit3ResearchID = uint256(keccak256("research.HousingUnit3"));

uint256 constant StarmapperResearchID = uint256(keccak256("research.Starmapper"));
uint256 constant Starmapper2ResearchID = uint256(keccak256("research.Starmapper2"));
uint256 constant Starmapper3ResearchID = uint256(keccak256("research.Starmapper3"));

string constant MiningKey = "research.MiningResearch";
uint256 constant MiningResearch = uint256(keccak256(abi.encodePacked(MiningKey, uint256(1))));
uint256 constant MiningResearch2 = uint256(keccak256(abi.encodePacked(MiningKey, uint256(2))));
uint256 constant MiningResearch3 = uint256(keccak256(abi.encodePacked(MiningKey, uint256(3))));
uint256 constant MiningResearch4 = uint256(keccak256(abi.encodePacked(MiningKey, uint256(4))));
uint256 constant MiningResearch5 = uint256(keccak256(abi.encodePacked(MiningKey, uint256(5))));

string constant ExpansionKey = "research.Expansion";
// this behavior is identical to LibEncode.hashKeyEntity
uint256 constant ExpansionResearch = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(1))));
uint256 constant ExpansionResearch2 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(2))));
uint256 constant ExpansionResearch3 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(3))));
uint256 constant ExpansionResearch4 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(4))));
uint256 constant ExpansionResearch5 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(5))));
uint256 constant ExpansionResearch6 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(6))));
uint256 constant ExpansionResearch7 = uint256(keccak256(abi.encodePacked(ExpansionKey, uint256(7))));

string constant MiningVesselUpgradeKey = "research.MiningVesselUpgrade";
uint256 constant MiningVesselUpgrade = uint256(keccak256(abi.encodePacked(MiningVesselUpgradeKey, uint256(1))));
uint256 constant MiningVesselUpgrade2 = uint256(keccak256(abi.encodePacked(MiningVesselUpgradeKey, uint256(2))));
uint256 constant MiningVesselUpgrade3 = uint256(keccak256(abi.encodePacked(MiningVesselUpgradeKey, uint256(3))));
uint256 constant MiningVesselUpgrade4 = uint256(keccak256(abi.encodePacked(MiningVesselUpgradeKey, uint256(4))));
uint256 constant MiningVesselUpgrade5 = uint256(keccak256(abi.encodePacked(MiningVesselUpgradeKey, uint256(5))));

string constant AnvilDroneUpgradeKey = "research.AnvilDroneUpgrade";
uint256 constant AnvilDroneUpgrade = uint256(keccak256(abi.encodePacked(AnvilDroneUpgradeKey, uint256(1))));
uint256 constant AnvilDroneUpgrade2 = uint256(keccak256(abi.encodePacked(AnvilDroneUpgradeKey, uint256(2))));
uint256 constant AnvilDroneUpgrade3 = uint256(keccak256(abi.encodePacked(AnvilDroneUpgradeKey, uint256(3))));
uint256 constant AnvilDroneUpgrade4 = uint256(keccak256(abi.encodePacked(AnvilDroneUpgradeKey, uint256(4))));
uint256 constant AnvilDroneUpgrade5 = uint256(keccak256(abi.encodePacked(AnvilDroneUpgradeKey, uint256(5))));

string constant HammerDroneUpgradeKey = "research.HammerDroneUpgrade";
uint256 constant HammerDroneUpgrade = uint256(keccak256(abi.encodePacked(HammerDroneUpgradeKey, uint256(1))));
uint256 constant HammerDroneUpgrade2 = uint256(keccak256(abi.encodePacked(HammerDroneUpgradeKey, uint256(2))));
uint256 constant HammerDroneUpgrade3 = uint256(keccak256(abi.encodePacked(HammerDroneUpgradeKey, uint256(3))));
uint256 constant HammerDroneUpgrade4 = uint256(keccak256(abi.encodePacked(HammerDroneUpgradeKey, uint256(4))));
uint256 constant HammerDroneUpgrade5 = uint256(keccak256(abi.encodePacked(HammerDroneUpgradeKey, uint256(5))));

string constant StingerDroneUpgradeKey = "research.StingerDroneUpgrade";
uint256 constant StingerDroneUpgrade = uint256(keccak256(abi.encodePacked(StingerDroneUpgradeKey, uint256(1))));
uint256 constant StingerDroneUpgrade2 = uint256(keccak256(abi.encodePacked(StingerDroneUpgradeKey, uint256(2))));
uint256 constant StingerDroneUpgrade3 = uint256(keccak256(abi.encodePacked(StingerDroneUpgradeKey, uint256(3))));
uint256 constant StingerDroneUpgrade4 = uint256(keccak256(abi.encodePacked(StingerDroneUpgradeKey, uint256(4))));
uint256 constant StingerDroneUpgrade5 = uint256(keccak256(abi.encodePacked(StingerDroneUpgradeKey, uint256(5))));

string constant AegisDroneUpgradeKey = "research.AegisDroneUpgrade";
uint256 constant AegisDroneUpgrade = uint256(keccak256(abi.encodePacked(AegisDroneUpgradeKey, uint256(1))));
uint256 constant AegisDroneUpgrade2 = uint256(keccak256(abi.encodePacked(AegisDroneUpgradeKey, uint256(2))));
uint256 constant AegisDroneUpgrade3 = uint256(keccak256(abi.encodePacked(AegisDroneUpgradeKey, uint256(3))));
uint256 constant AegisDroneUpgrade4 = uint256(keccak256(abi.encodePacked(AegisDroneUpgradeKey, uint256(4))));
uint256 constant AegisDroneUpgrade5 = uint256(keccak256(abi.encodePacked(AegisDroneUpgradeKey, uint256(5))));
