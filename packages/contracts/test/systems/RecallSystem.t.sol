// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract RecallSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 to;
  PositionData originPosition = PositionData(0, 0, 0);
  PositionData destinationPosition = PositionData(0, 10, 0);
  bytes32 origin = "origin";
  bytes32 destination = "destination";

  bytes32 unitPrototype = "unitPrototype";
  EUnit unit = EUnit.AegisDrone;
  uint256[NUM_UNITS] unitCounts;

  bytes32 building = "building";
  bytes32 buildingPrototype = "buildingPrototype";
  bytes32 rock = bytes32("rock");

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    to = addressToEntity(alice);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);

    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unitPrototype;
    P_UnitPrototypes.set(unitTypes);
    BuildingType.set(building, buildingPrototype);
    OwnedBy.set(building, player);
  }

  function testRecallUnitsFromMotherlode() public {
    setupRecall();
    Home.setAsteroid(player, origin);
    world.recallStationedUnits(destination);
    assertEq(UnitCount.get(player, destination, unitPrototype), 0);
    assertEq(UnitCount.get(player, origin, unitPrototype), 70);
  }

  function testRecallUnitsProductionFromMotherlode() public {
    setupRecall();
    Home.setAsteroid(player, origin);
    P_MiningRate.set(unitPrototype, 0, 1);
    Motherlode.set(destination, uint8(ESize.Medium), uint8(EResource.Iron));
    ProductionRate.set(player, uint8(EResource.Iron), 50);
    world.recallStationedUnits(destination);
    assertEq(ProductionRate.get(player, uint8(EResource.Iron)), 0);
  }

  function testRecallUnitsProductionClaimFromMotherlode() public {
    setupRecall();
    Home.setAsteroid(player, origin);
    P_MiningRate.set(unitPrototype, 0, 1);
    Motherlode.set(destination, uint8(ESize.Medium), uint8(EResource.Iron));
    MaxResourceCount.set(player, uint8(EResource.Iron), 100000);
    ProductionRate.set(player, uint8(EResource.Iron), 50);
    LastClaimedAt.set(player, block.timestamp);
    vm.warp(block.timestamp + 10);
    world.recallStationedUnits(destination);
    assertEq(ResourceCount.get(player, uint8(EResource.Iron)), 500);
    assertEq(ProductionRate.get(player, uint8(EResource.Iron)), 0);
  }

  function setupRecall() public {
    RockType.set(origin, uint8(ERock.Asteroid));
    RockType.set(destination, uint8(ERock.Motherlode));
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, player);
    UnitCount.set(player, origin, unitPrototype, 20);
    UnitCount.set(player, destination, unitPrototype, 50);
  }
}
