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
    ProductionRate.set(destination, uint8(EResource.Iron), 50);
    world.recallStationedUnits(destination);
    assertEq(ProductionRate.get(destination, uint8(EResource.Iron)), 0);
  }

  function testRecallUnitsProductionClaimFromMotherlode() public {
    setupRecall();
    Home.setAsteroid(player, origin);
    OwnedBy.set(origin, player);
    P_MiningRate.set(unitPrototype, 0, 1);
    OwnedBy.set(destination, player);
    MaxResourceCount.set(destination, uint8(EResource.R_Titanium), 10000000);
    MaxResourceCount.set(origin, uint8(EResource.Titanium), 10000000);
    ProductionRate.set(destination, uint8(EResource.Titanium), 50);
    ConsumptionRate.set(destination, uint8(EResource.R_Titanium), 50);
    ResourceCount.set(destination, uint8(EResource.R_Titanium), 10000000);
    LastClaimedAt.set(destination, block.timestamp);
    console.log("before warp ", block.timestamp);
    vm.warp(block.timestamp + 10);
    console.log("warped to ", block.timestamp);
    world.recallStationedUnits(destination);
    console.log("after recall");
    assertEq(ProducedResource.get(player, uint8(EResource.Titanium)), 500, "produced resources does not match");
    assertEq(ResourceCount.get(origin, uint8(EResource.Titanium)), 500, "resource count does not match");
    assertEq(ProductionRate.get(destination, uint8(EResource.Titanium)), 0, "production rate does not match");
    assertEq(ConsumptionRate.get(destination, uint8(EResource.R_Titanium)), 0, "consumption rate does not match");
  }

  function setupRecall() public {
    Asteroid.setIsAsteroid(origin, true);
    Asteroid.setIsAsteroid(destination, true);
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, player);
    UnitCount.set(player, origin, unitPrototype, 20);
    UnitCount.set(player, destination, unitPrototype, 50);
  }
}
