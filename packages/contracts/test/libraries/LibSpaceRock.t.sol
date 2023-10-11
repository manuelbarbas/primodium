// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";
import { LibSpaceRock } from "codegen/Libraries.sol";

/* 
Test when player and rock are valid, and rockType is not NULL.
Test when rockType is NULL.
Test when rockType is Asteroid.
updateHomeRock Function
Test when player has a home asteroid.
Test when player does not have a home asteroid (uint256(home) is 0).
Edge Cases
Test when player or rock is an empty bytes32.

*/

contract LibSpaceRockTest is PrimodiumTest {
  bytes32 rock = bytes32("rock");
  bytes32 player;

  bytes32 unit = "unit";
  bytes32 unitPrototype = "unitPrototype";

  bytes32 building = "building";
  bytes32 buildingPrototype = "buildingPrototype";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(worldAddress);
    BuildingType.set(building, buildingPrototype);
    P_GameConfigData memory config = P_GameConfig.get();
    config.unitProductionRate = 100;
    P_GameConfig.set(config);
  }

  function testUpdateRockNoRock() public {
    vm.expectRevert(bytes("[UpdateRockSystem] Rock does not exist"));
    LibSpaceRock.updateRock(player, bytes32(0));
  }

  function testUpdateHomeRockNoHomeRock() public {
    vm.expectRevert(bytes("[UpdateRockSystem] Player does not have a home asteroid"));
    LibSpaceRock.updateHomeRock(player);
  }

  // copied from LibUnit.t.sol
  function setupClaimUnits() public {
    Level.set(building, 1);
    LastClaimedAt.set(building, block.timestamp - 100);
    P_UnitProdMultiplier.set(building, 1, 100);
    P_Unit.setTrainingTime(unitPrototype, 0, 1);

    QueueItemUnitsData memory item = QueueItemUnitsData(unitPrototype, 100);
    UnitProductionQueue.enqueue(building, item);
    UnitFactorySet.add(player, building);
  }

  function testUpdateMotherlode() public {
    RockType.set(rock, uint8(ERock.Motherlode));

    setupClaimUnits();

    Home.setAsteroid(player, rock);
    MaxResourceCount.set(player, Iron, 1000);
    ProductionRate.set(player, Iron, 10);
    LastClaimedAt.set(player, block.timestamp - 10);

    LibSpaceRock.updateRock(player, rock);

    assertEq(ResourceCount.get(player, Iron), 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 0);
  }

  function testUpdateAsteroid() public {
    RockType.set(rock, uint8(ERock.Asteroid));

    setupClaimUnits();
    Home.setAsteroid(player, rock);
    MaxResourceCount.set(player, Iron, 1000);
    ProductionRate.set(player, Iron, 10);
    LastClaimedAt.set(player, block.timestamp - 10);

    LibSpaceRock.updateRock(player, rock);

    assertEq(ResourceCount.get(player, Iron), 100);
    assertEq(UnitCount.get(player, Home.getAsteroid(player), unitPrototype), 100);
  }

  function testInvalidPlayer() public {
    RockType.set(rock, uint8(ERock.Motherlode));
    vm.expectRevert(bytes("[UpdateRockSystem] Rock does not exist"));
    LibSpaceRock.updateRock(bytes32(0), rock);
  }

  function testInvalidRock() public {
    vm.expectRevert(bytes("[UpdateRockSystem] Rock does not exist"));
    LibSpaceRock.updateRock(player, bytes32(0));
  }
}
