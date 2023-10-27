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
    bytes32[] memory oldChildren = Children.get(mainBaseEntity);

    world.move(mainBasePosition, newPosition);
    mainBasePosition = Position.get(mainBaseEntity);
    assertEq(mainBasePosition.x, newPosition.x, "building position should have updated");
    assertEq(mainBasePosition.y, newPosition.y, "building position should have updated");
    assertEq(mainBasePosition.parent, newPosition.parent, "building position should have updated");
    int32[] memory blueprint = P_Blueprint.get(MainBasePrototypeId);
    bytes32[] memory children = Children.get(mainBaseEntity);

    assertEq(blueprint.length, children.length * 2, "children length should match blueprint length");
    for (uint256 i = 0; i < children.length; i++) {
      PositionData memory tilePosition = Position.get(children[i]);
      assertEq(
        tilePosition,
        PositionData(
          blueprint[i * 2] + mainBasePosition.x,
          blueprint[i * 2 + 1] + mainBasePosition.y,
          mainBasePosition.parent
        )
      );
      assertEq(mainBaseEntity, OwnedBy.get(children[i]), "children should be owned by the building");
    }

    for (uint256 i = 0; i < oldChildren.length; i++) {
      assertEq(OwnedBy.get(oldChildren[i]), 0, "old children should be unowned");
    }
  }

  function testMoveSomeSameTiles() public {
    bytes32 mainBaseEntity = Home.get(playerEntity).mainBase;
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);
    PositionData memory newPosition = PositionData(
      mainBasePosition.x + 1,
      mainBasePosition.y + 1,
      mainBasePosition.parent
    );
    bytes32[] memory oldChildren = Children.get(mainBaseEntity);

    world.move(mainBasePosition, newPosition);
    mainBasePosition = Position.get(mainBaseEntity);
    assertEq(mainBasePosition.x, newPosition.x, "building position should have updated");
    assertEq(mainBasePosition.y, newPosition.y, "building position should have updated");
    assertEq(mainBasePosition.parent, newPosition.parent, "building position should have updated");
    int32[] memory blueprint = P_Blueprint.get(MainBasePrototypeId);
    bytes32[] memory children = Children.get(mainBaseEntity);

    assertEq(blueprint.length, children.length * 2, "children length should match blueprint length");
    for (uint256 i = 0; i < children.length; i++) {
      PositionData memory tilePosition = Position.get(children[i]);
      assertEq(
        tilePosition,
        PositionData(
          blueprint[i * 2] + mainBasePosition.x,
          blueprint[i * 2 + 1] + mainBasePosition.y,
          mainBasePosition.parent
        )
      );
      assertEq(mainBaseEntity, OwnedBy.get(children[i]), "children should be owned by the building");
    }
  }
}
