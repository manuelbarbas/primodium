// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;
import { IUint256Component } from "solecs/interfaces/IUint256Component.sol";
import { getAddressById } from "solecs/utils.sol";

import { ItemPrototypeComponent, ID as ItemPrototypeComponentID } from "../components/ItemPrototypeComponent.sol";
import { OccurrenceComponent, ID as OccurrenceComponentID, FunctionSelector } from "../components/OccurrenceComponent.sol";
import { OccurrenceSystem, ID as OccurrenceSystemID } from "../systems/OccurrenceSystem.sol";

//blocks: LithiumID, RegolithID, SandstoneID, AlluviumID, WaterID

uint256 constant LithiumID = uint256(keccak256("block.Lithium"));
uint256 constant RegolithID = uint256(keccak256("block.Regolith"));
uint256 constant SandstoneID = uint256(keccak256("block.Sandstone"));
uint256 constant AlluviumID = uint256(keccak256("block.Alluvium"));
uint256 constant WaterID = uint256(keccak256("block.Water"));
uint256 constant LithiumMinerID = uint256(keccak256("block.LithiumMiner"));

function defineBlocks(
  ItemPrototypeComponent itemPrototypeComponent,
  OccurrenceComponent occurrenceComponent,
  OccurrenceSystem occurrenceSystem
) {
  //for tiles that spawn naturally in the world
  itemPrototypeComponent.set(LithiumID);
  occurrenceComponent.set(LithiumID, FunctionSelector(address(occurrenceSystem), occurrenceSystem.Lithium.selector));

  itemPrototypeComponent.set(RegolithID);
  occurrenceComponent.set(RegolithID, FunctionSelector(address(occurrenceSystem), occurrenceSystem.Regolith.selector));

  itemPrototypeComponent.set(SandstoneID);
  occurrenceComponent.set(SandstoneID, FunctionSelector(address(occurrenceSystem), occurrenceSystem.Sandstone.selector));

  itemPrototypeComponent.set(AlluviumID);
  occurrenceComponent.set(AlluviumID, FunctionSelector(address(occurrenceSystem), occurrenceSystem.Alluvium.selector));

  itemPrototypeComponent.set(WaterID);
  occurrenceComponent.set(WaterID, FunctionSelector(address(occurrenceSystem), occurrenceSystem.Water.selector));
  
  //for tiles that are craftable but don't naturally spawn
  itemPrototypeComponent.set(LithiumMinerID);
}