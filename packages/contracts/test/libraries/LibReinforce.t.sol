// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import "test/PrimodiumTest.t.sol";

contract LibReinforceTest is PrimodiumTest {
  bytes32 player;

  bytes32 origin = "origin";
  bytes32 destination = "destination";

  bytes32 unit = "unit";
  bytes32 arrivalId = "arrivalId";

  bytes32 unit2 = "unit2";
  uint256[NUM_UNITS] unitCounts;

  Arrival arrival =
    Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      sendTime: block.timestamp,
      from: "from",
      to: "to",
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    arrival.from = player;
    bytes32[] memory unitTypes = new bytes32[](NUM_UNITS);
    unitTypes[0] = unit;
    unitTypes[1] = unit2;
    P_UnitPrototypes.set(unitTypes);
  }

  function testReinforce() public {
    ArrivalCount.set(player, 10);
    arrival.sendType = ESendType.Reinforce;

    unitCounts[0] = (47);
    arrival.unitCounts = unitCounts;
    arrival.to = player;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);

    assertEq(ArrivalCount.get(player), 9);
    assertFalse(ArrivalsMap.has(player, destination, arrivalId));
    assertEq(UnitCount.get(destination, unit), 47);
  }

  function testReinforceAnotherPlayer() public {
    arrival.sendType = ESendType.Reinforce;
    bytes32 anotherPlayer = "anotherPlayer";
    Home.set(player, origin);
    Home.set(anotherPlayer, destination);

    arrival.to = anotherPlayer;
    arrival.from = player;
    arrival.origin = origin;
    arrival.destination = destination;
    unitCounts[0] = (1);
    arrival.unitCounts = unitCounts;
    arrivalId = LibSend.sendUnits(arrival);

    vm.warp(block.timestamp + 1);

    P_IsUtility.set(Iron, true);

    P_RequiredResourcesData memory requiredResourcesData = P_RequiredResourcesData(new uint8[](1), new uint256[](1));
    requiredResourcesData.resources[0] = uint8(Iron);
    requiredResourcesData.amounts[0] = 33;
    P_RequiredResources.set(unit, 0, requiredResourcesData);
    uint256 before = 75;

    console.log("before increase 1");
    LibProduction.increaseResourceProduction(origin, EResource(Iron), before);
    console.log("before increase 2");
    LibProduction.increaseResourceProduction(destination, EResource(Iron), before);
    console.log("before soend 1");
    LibResource.spendUnitRequiredResources(origin, unit, 1);
    console.log("before reinforce");
    LibReinforce.reinforce(anotherPlayer, destination, arrivalId);
    console.log("after reinforce");
    assertEq(ResourceCount.get(destination, Iron), before - 33);
    assertEq(ResourceCount.get(origin, Iron), before);
  }

  function testFailReinforceWrongSendType() public {
    arrival.sendType = ESendType.Invade;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);
  }

  function testFailReinforceTooEarly() public {
    arrival.sendType = ESendType.Reinforce;
    arrival.arrivalTime = block.timestamp + 1;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.reinforce(player, destination, arrivalId);
  }

  /* -------------------------------- Reinforce ------------------------------- */

  function testRecall() public {
    ArrivalCount.set(player, 10);
    arrival.sendType = ESendType.Reinforce;
    arrival.arrivalTime = block.timestamp - 1;
    arrival.to = player;

    unitCounts[0] = (47);

    arrival.unitCounts = unitCounts;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.recallReinforcement(player, destination, arrivalId);

    assertEq(ArrivalCount.get(player), 9);
    assertFalse(ArrivalsMap.has(player, destination, arrivalId));
    assertEq(UnitCount.get(Home.get(player), unit), 47);
  }

  function testRecallNotReinforce() public {
    ArrivalCount.set(player, 10);
    arrival.sendType = ESendType.Invade;
    arrival.arrivalTime = block.timestamp - 1;

    unitCounts[0] = (47);

    arrival.unitCounts = unitCounts;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.recallReinforcement(player, destination, arrivalId);

    assertEq(ArrivalCount.get(player), 10);
    assertTrue(ArrivalsMap.has(player, destination, arrivalId));
    assertEq(UnitCount.get(Home.get(player), unit), 0);
  }

  function testRecallAll() public {
    ArrivalCount.set(player, 10);
    OwnedBy.set(destination, player);
    arrival.sendType = ESendType.Reinforce;
    arrival.arrivalTime = block.timestamp - 1;
    arrival.to = player;

    unitCounts[0] = (47);
    arrival.unitCounts = unitCounts;

    ArrivalsMap.set(player, destination, arrivalId, arrival);
    LibReinforce.recallAllReinforcements(destination);

    Arrival memory arrival2 = Arrival({
      sendTime: block.timestamp,
      sendType: ESendType.Reinforce,
      arrivalTime: block.timestamp - 1,
      from: player,
      to: player,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });
    uint256[NUM_UNITS] memory unitCounts2;
    unitCounts2[0] = 53;

    arrival2.unitCounts = unitCounts2;
    bytes32 key2 = keccak256(abi.encode(arrival));

    ArrivalsMap.set(player, destination, key2, arrival2);
    LibReinforce.recallAllReinforcements(destination);

    assertEq(ArrivalCount.get(player), 8);
    assertFalse(ArrivalsMap.has(player, destination, arrivalId));
    assertEq(UnitCount.get(Home.get(player), unit), 100);
  }
}
