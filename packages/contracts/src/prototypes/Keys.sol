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

uint256 constant ElectricityPassiveResourceID = uint256(keccak256("item.ElectricityPassiveResource"));

uint256 constant IronPlateCraftedItemID = uint256(keccak256("item.IronPlateCrafted"));
uint256 constant AlloyCraftedItemID = uint256(keccak256("item.AlloyCrafted"));
uint256 constant LithiumCopperOxideCraftedItemID = uint256(keccak256("item.LithiumCopperOxideCrafted"));
uint256 constant SpaceFuelCraftedItemID = uint256(keccak256("item.SpaceFuelCrafted"));

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

uint256 constant LithiumCopperOxideFactoryResearchID = uint256(keccak256("research.LithiumCopperOxideFactory"));
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

// Building key
string constant BuildingKey = "building";
