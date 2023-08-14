// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ComponentDevSystem, ID as ComponentDevSystemID } from "../../systems/ComponentDevSystem.sol";
import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import "../../prototypes.sol";

import { LibBuilding } from "../../libraries/LibBuilding.sol";

import { Dimensions, Bounds } from "../../types.sol";

contract LibBuildingTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  ComponentDevSystem componentDevSystem;

  function setUp() public override {
    super.setUp();
    componentDevSystem = ComponentDevSystem(system(ComponentDevSystemID));
  }

  function testGetPlayerBounds() public {
    spawn(alice);
    vm.startPrank(alice);

    Dimensions memory max = Dimensions(10, 10);
    componentDevSystem.executeTyped(DimensionsComponentID, SingletonID, abi.encode(max));

    uint256 playerEntity = addressToEntity(alice);
    uint32 playerLevel = LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(playerEntity);
    uint256 researchLevelEntity = LibEncode.hashKeyEntity(ExpansionResearch, playerLevel);

    Dimensions memory curr = Dimensions(5, 5);
    componentDevSystem.executeTyped(DimensionsComponentID, researchLevelEntity, abi.encode(curr));
    Bounds memory bounds = LibBuilding.getPlayerBounds(world, playerEntity);

    assertEq(bounds.minX, (max.x - curr.x) / 2);
    assertEq(bounds.maxX, (max.x + curr.x) / 2);
    assertEq(bounds.minY, (max.y - curr.y) / 2);
    assertEq(bounds.maxY, (max.y + curr.y) / 2);
  }
}
