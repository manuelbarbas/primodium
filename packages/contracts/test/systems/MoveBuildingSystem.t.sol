// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { WorldResourceIdInstance, WorldResourceIdLib } from "@latticexyz/world/src/WorldResourceId.sol";
import { AccessControl } from "@latticexyz/world/src/AccessControl.sol";

contract MoveBuildingSystemTest is PrimodiumTest {
  bytes32 playerEntity;

  function setUp() public override {
    super.setUp();
    // init other
    spawn(creator);
    spawn(bob);
    playerEntity = addressToEntity(creator);
    vm.startPrank(creator);
  }

  function testShipyardMove() public {
    EBuilding building = EBuilding.Shipyard;
    Dimensions.set(ExpansionKey, 1, 35, 27);
    P_RequiredResourcesData memory requiredResources = getBuildCost(building);
    provideResources(Home.get(playerEntity), requiredResources);
    vm.startPrank(creator);
    removeRequirements(building);
    P_RequiredBaseLevel.set(P_EnumToPrototype.get(BuildingKey, uint8(EBuilding.Shipyard)), 1, 0);

    PositionData memory originalPosition = getTilePosition(Home.get(playerEntity), building);
    bytes32 ironMine = world.build(building, originalPosition);
    PositionData memory newPosition = getTilePosition(Home.get(playerEntity), building);
    uint256 gas = gasleft();
    world.moveBuilding(ironMine, newPosition);
    console.log("after", gas - gasleft());
  }

  function testMove() public {
    bytes32 mainBaseEntity = Home.get(Home.get(playerEntity));
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);
    PositionData memory newPosition = PositionData(
      mainBasePosition.x + 3,
      mainBasePosition.y + 3,
      mainBasePosition.parent
    );
    int32[] memory oldTilePositions = TilePositions.get(mainBaseEntity);

    uint256 gas = gasleft();
    world.moveBuilding(mainBaseEntity, newPosition);
    console.log("after", gas - gasleft());

    mainBasePosition = Position.get(mainBaseEntity);
    assertEq(mainBasePosition.x, newPosition.x, "building position should have updated");
    assertEq(mainBasePosition.y, newPosition.y, "building position should have updated");
    assertEq(mainBasePosition.parent, newPosition.parent, "building position should have updated");
    int32[] memory blueprint = P_Blueprint.get(MainBasePrototypeId);
    int32[] memory tilePositions = TilePositions.get(mainBaseEntity);

    assertEq(blueprint.length, tilePositions.length, "tile positions length should match blueprint length");

    assertTrue(LibAsteroid.allTilesAvailable(Home.get(playerEntity), oldTilePositions));

    for (uint256 i = 0; i < tilePositions.length; i += 2) {
      assertEq(tilePositions[i], blueprint[i] + mainBasePosition.x);
      assertEq(tilePositions[i + 1], blueprint[i + 1] + mainBasePosition.y);

      int32[] memory currPosition = new int32[](2);
      currPosition[0] = tilePositions[i];
      currPosition[1] = tilePositions[i + 1];
      assertFalse(LibAsteroid.allTilesAvailable(Home.get(playerEntity), currPosition));
    }
  }

  function testFailMoveOutOfBounds() public {
    bytes32 mainBaseEntity = Home.get(Home.get(playerEntity));
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);
    PositionData memory newPosition = PositionData(
      mainBasePosition.x + 15,
      mainBasePosition.y + 15,
      mainBasePosition.parent
    );

    world.moveBuilding(mainBaseEntity, newPosition);
  }

  function testMoveSomeSameTiles() public {
    bytes32 mainBaseEntity = Home.get(Home.get(playerEntity));
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);
    PositionData memory newPosition = PositionData(
      mainBasePosition.x + 1,
      mainBasePosition.y + 1,
      mainBasePosition.parent
    );

    world.moveBuilding(mainBaseEntity, newPosition);
    mainBasePosition = Position.get(mainBaseEntity);
    assertEq(mainBasePosition.x, newPosition.x, "building position should have updated");
    assertEq(mainBasePosition.y, newPosition.y, "building position should have updated");
    assertEq(mainBasePosition.parent, newPosition.parent, "building position should have updated");
    int32[] memory blueprint = P_Blueprint.get(MainBasePrototypeId);
    int32[] memory tilePositions = TilePositions.get(mainBaseEntity);

    assertEq(blueprint.length, tilePositions.length, "tile positions length should match blueprint length");

    for (uint256 i = 0; i < tilePositions.length; i += 2) {
      assertEq(tilePositions[i], blueprint[i] + mainBasePosition.x);
      assertEq(tilePositions[i + 1], blueprint[i + 1] + mainBasePosition.y);

      int32[] memory currPosition = new int32[](2);
      currPosition[0] = tilePositions[i];
      currPosition[1] = tilePositions[i + 1];
      assertFalse(LibAsteroid.allTilesAvailable(Home.get(playerEntity), currPosition));
    }
  }

  function testFailMoveOnTopOfBuildingTiles() public {
    P_RequiredTile.deleteRecord(IronMinePrototypeId);

    console.log("testMoveBuildTiles");
    bytes32 mainBaseEntity = Home.get(Home.get(playerEntity));
    PositionData memory mainBasePosition = Position.get(mainBaseEntity);

    PositionData memory overlappedPosition = PositionData(
      mainBasePosition.x - 3,
      mainBasePosition.y - 3,
      mainBasePosition.parent
    );
    world.build(EBuilding.IronMine, overlappedPosition);

    PositionData memory newPosition = PositionData(
      mainBasePosition.x - 1,
      mainBasePosition.y - 1,
      mainBasePosition.parent
    );

    world.moveBuilding(mainBaseEntity, newPosition);
    console.log("moved success");
    uint256 timestamp = block.timestamp;
    vm.warp(block.timestamp + 1);
    assertTrue(timestamp != block.timestamp, "timestamp should have updated");
    assertEq(
      Spawned.get(LibEncode.getTimedHash(BuildingKey, mainBasePosition)),
      false,
      "new building should not be spawned"
    );

    world.build(EBuilding.IronMine, mainBasePosition);
  }
}
