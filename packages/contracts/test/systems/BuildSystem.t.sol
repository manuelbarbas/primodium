// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract BuildSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    // init other
    spawn(alice);
  }

  // todo: sort these tests. the first test should be a vanilla build system call

  function testBuildLargeBuilding() public {
    int32[] memory blueprint = get2x2Blueprint();
    bytes32[] memory keys = new bytes32[](1);
    keys[0] = IronMinePrototypeId;

    world.devSetRecord(P_BlueprintTableId, keys, P_Blueprint.encode(blueprint), P_Blueprint.getValueSchema());
    vm.startPrank(alice);
    bytes32 buildingEntity = world.build(EBuilding.IronMine, getIronPosition(alice));

    PositionData memory buildingPosition = Position.get(world, buildingEntity);
    logPosition(buildingPosition);
    bytes32[] memory children = Children.get(world, buildingEntity);
    assertEq(blueprint.length, children.length * 2);

    for (uint256 i = 0; i < children.length; i++) {
      PositionData memory tilePosition = Position.get(children[i]);
      assertEq(
        tilePosition,
        PositionData(
          blueprint[i * 2] + buildingPosition.x,
          blueprint[i * 2 + 1] + buildingPosition.y,
          buildingPosition.parent
        )
      );
      assertEq(buildingEntity, OwnedBy.get(children[i]));
    }
  }

  function testInvalidIndexFail() public {
    vm.startPrank(alice);

    PositionData memory nonIronPositionData = getNonIronPosition(alice);

    vm.expectRevert(bytes("[BuildSystem] Invalid building type"));
    world.build(EBuilding.LENGTH, nonIronPositionData);

    vm.stopPrank();
  }

  function testFailIronMineOnNonIron() public {
    vm.startPrank(alice);

    PositionData memory nonIronPositionData = getNonIronPosition(alice);

    world.build(EBuilding.IronMine, nonIronPositionData);

    vm.stopPrank();
  }

  function testSameXYCanCollide() public {
    vm.startPrank(alice);
    PositionData memory ironPositionData = getIronPosition(alice);
    world.build(EBuilding.IronMine, ironPositionData);
    vm.stopPrank();
    spawn(bob);
    vm.startPrank(bob);
    ironPositionData = getIronPosition(bob);
    world.build(EBuilding.IronMine, ironPositionData);

    vm.stopPrank();
  }

  function testSameXYZCannotCollideFail() public {
    vm.startPrank(alice);
    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, getPosition1(alice));

    vm.expectRevert(bytes("[BuildSystem] Building already exists"));
    world.build(EBuilding.IronMine, getPosition1(alice));
  }

  function testBuiltOnWrongAsteroid() public {
    vm.startPrank(alice);
    PositionData memory coord = getPosition2(alice);
    coord.parent = bytes32(uint256(69));

    vm.expectRevert(bytes("[BuildSystem] Building must be built on your home asteroid"));
    world.build(EBuilding.IronMine, coord);
  }

  function testBuildTwiceMainBaseFail() public {
    vm.startPrank(alice);

    PositionData memory coord1 = getPosition3(alice);
    vm.expectRevert(bytes("[BuildSystem] Cannot build more than one main base per wallet"));
    world.build(EBuilding.MainBase, coord1);
    vm.stopPrank();
  }

  // function testFailBuildMainBaseLevelNotMet() public {
  //   vm.startPrank(alice);

  //   PositionData memory coord1 = getPosition3(alice);
  //   world.build(DebugSimpleBuildingMainBaseLevelReqID, coord1);
  //   vm.stopPrank();
  // }

  // function testBuildMainBaseLevelMet() public {
  //   vm.startPrank(alice);

    PositionData memory coord1 = getPosition3(alice);

    bytes32[] memory keys = new bytes32[](1);
    keys[0] = addressToEntity(alice);
    world.devSetRecord(
      P_RequiredBaseLevelTableId,
      keys,
      P_RequiredBaseLevel.encode(2),
      P_RequiredBaseLevel.getValueSchema()
    );

    removeRequirements(EBuilding.IronMine);
    world.build(EBuilding.IronMine, coord1);
    vm.stopPrank();
  }

  function testIronMineOnNonIronFail() public {
    vm.startPrank(alice);

    PositionData memory nonIronCoord = getNonIronPosition(alice);
    assertTrue(P_Terrain.get(nonIronCoord.x, nonIronCoord.y) != EResource.Iron, "Tile should not have iron");

    vm.expectRevert(bytes("[BuildSystem] Cannot build on this tile"));
    world.build(EBuilding.IronMine, nonIronCoord);

    vm.stopPrank();
  }
}
