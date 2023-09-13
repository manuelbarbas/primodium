// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";

contract BuildSystemTest is PrimodiumTest {
  function setUp() public override {
    super.setUp();
    // init other
    spawn(alice);
  }

  // todo: sort these tests. the first test should be a vanilla build system call
  function get2x2Blueprint() internal pure returns (int32[] memory blueprint) {
    blueprint = new int32[](8);

    blueprint[0] = 0;
    blueprint[1] = 0;

    blueprint[2] = 0;
    blueprint[3] = -1;

    blueprint[4] = -1;
    blueprint[5] = 0;

    blueprint[6] = -1;
    blueprint[7] = -1;
  }

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

  // function testFailMineBeforeBase() public {
  //   vm.startPrank(alice);

  //   // TEMP: tile -6, 2 does not have iron according to current generation seed
  //   Coord memory nonIronCoord = getNonIronCoord(alice);
  //   assertTrue(LibTerrain.getResourceByCoord(world, nonIronCoord) != IronID, "Tile should not have iron");

  //   buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

  //   vm.stopPrank();
  // }

  // function testFailIronMineOnNonIron() public {
  //   vm.startPrank(alice);

  //   // TEMP: tile -6, 2 does not have iron according to current generation seed
  //   Coord memory nonIronCoord = getNonIronCoord(alice);
  //   assertTrue(LibTerrain.getResourceByCoord(world, nonIronCoord) != IronID, "Tile should not have iron");

  //   buildSystem.executeTyped(DebugIronMineWithBuildLimitID, nonIronCoord);

  //   vm.stopPrank();
  // }

  // function testSameXYCanCollide() public {
  //   vm.startPrank(alice);
  //   Coord memory ironCoord = getIronCoord(alice);
  //   buildSystem.executeTyped(IronMineID, ironCoord);
  //   vm.stopPrank();
  //   spawn(bob);
  //   vm.startPrank(bob);
  //   ironCoord = getIronCoord(bob);
  //   buildSystem.executeTyped(IronMineID, ironCoord);

  //   vm.stopPrank();
  // }

  // function testFailSameXYZCannotCollide() public {
  //   vm.startPrank(alice);
  //   buildSystem.executeTyped(IronMineID, getCoord1(alice));
  //   buildSystem.executeTyped(DebugIronMineID, getCoord1(alice));
  // }

  // function testBuiltOnWrongAsteroid() public {
  //   vm.startPrank(alice);
  //   Coord memory coord = getCoord2(alice);
  //   coord.parent = 69;

  //   vm.expectRevert(bytes("[BuildSystem] Building must be built on your main asteroid"));
  //   buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
  // }

  // function testFailBuildTwiceSameCoord() public prank(alice) {
  //   Coord memory coord = getCoord1(alice);
  //   buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
  //   buildSystem.executeTyped(DebugSimpleBuildingNoReqsID, coord);
  // }

  // function testFailBuildTwiceMainBase() public {
  //   vm.startPrank(alice);

  //   Coord memory coord1 = getCoord3(alice);
  //   buildSystem.executeTyped(MainBaseID, coord1);
  //   vm.stopPrank();
  // }

  // function testFailBuildMainBaseLevelNotMet() public {
  //   vm.startPrank(alice);

  //   Coord memory coord1 = getCoord3(alice);
  //   buildSystem.executeTyped(DebugSimpleBuildingMainBaseLevelReqID, coord1);
  //   vm.stopPrank();
  // }

  // function testBuildMainBaseLevelMet() public {
  //   vm.startPrank(alice);

  //   Coord memory coord1 = getCoord3(alice);
  //   componentDevSystem.executeTyped(
  //     LevelComponentID,
  //     mainBaseComponent.getValue(addressToEntity(alice)),
  //     abi.encode(2)
  //   );
  //   buildSystem.executeTyped(DebugSimpleBuildingMainBaseLevelReqID, coord1);
  //   vm.stopPrank();
  // }
}
