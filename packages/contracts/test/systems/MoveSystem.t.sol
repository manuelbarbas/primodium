// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { WorldResourceIdInstance, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

contract MoveSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  function testMove() public {
    bytes32 mainBaseEntity = Home.get(playerEntity).mainBase;
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);
    PositionData memory newPosition = PositionData(
      mainBasePosition.x + 3,
      mainBasePosition.y + 3,
      mainBasePosition.parent
    );

    world.move(mainBasePosition, newPosition);
    mainBasePosition = Position.get(mainBaseEntity);
    assertEq(mainBasePosition.x, newPosition.x, "building position should have updated");
    assertEq(mainBasePosition.y, newPosition.y, "building position should have updated");
    assertEq(mainBasePosition.parent, newPosition.parent, "building position should have updated");
  }
}
