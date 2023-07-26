// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { BolutiteID, CopperID, IridiumID, IronID, KimberliteID, LithiumID, OsmiumID, TitaniumID, TungstenID, UraniniteID } from "../prototypes/Resource.sol";

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
uint256 constant AlloyCraftedItemID = uint256(keccak256("item.AlloyCrafted"));
uint256 constant LithiumCopperOxideCraftedItemID = uint256(keccak256("item.LithiumCopperOxideCrafted"));
uint256 constant SpaceFuelCraftedItemID = uint256(keccak256("item.SpaceFuelCrafted"));
