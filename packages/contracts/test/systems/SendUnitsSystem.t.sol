// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract SendUnitsSystemTest is PrimodiumTest {
  bytes32 player;
  bytes32 to;
  PositionData originPosition = PositionData(0, 0, 0);
  PositionData destinationPosition = PositionData(0, 10, 0);
  bytes32 origin = "origin";
  bytes32 destination = "destination";

  bytes32 unitPrototype = "unitPrototype";
  EUnit unit = EUnit.AegisDrone;
  ArrivalUnit[] arrivalUnits;

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, mining: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    player = addressToEntity(worldAddress);
    to = addressToEntity(alice);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);
  }

  // checkMovementRules Function
  // Test each rule in isolation.
  // Test combinations where multiple rules apply.
  // Test with exceeded move count.
  // Test with same origin and destination.
  // Test moving from an asteroid you don't own.
  // Test moving between motherlodes.

  function prepareTestMovementRules() public {
    RockType.set(origin, ERock.Asteroid);
    RockType.set(destination, ERock.Asteroid);
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    ResourceCount.set(player, EResource.U_MaxMoves, 10);
  }

  function testMovementRulesNotEnoughMoves() public {
    prepareTestMovementRules();
    ResourceCount.set(player, EResource.U_MaxMoves, 0);
    vm.expectRevert(bytes("[SendUnits] Reached max move count"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesNoOrigin() public {
    prepareTestMovementRules();
    RockType.deleteRecord(origin);
    vm.expectRevert();
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesNoDest() public {
    prepareTestMovementRules();
    RockType.deleteRecord(destination);
    vm.expectRevert();
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesSameRock() public {
    prepareTestMovementRules();

    vm.expectRevert(bytes("[SendUnits] Origin and destination cannot be the same"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, originPosition, to);
  }

  function testMovementRulesAsteroidOriginOwnerNotPlayer() public {
    prepareTestMovementRules();

    OwnedBy.set(origin, addressToEntity(bob));
    RockType.set(origin, ERock.Asteroid);
    vm.expectRevert(bytes("[SendUnits] Must move from an asteroid you own"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesDestAndOriginAreMotherlodes() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Motherlode);
    RockType.set(origin, ERock.Motherlode);
    vm.expectRevert(bytes("[SendUnits] Cannot move between motherlodes"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesInvadeYourself() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Motherlode);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(destination, player);
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Cannot invade yourself"));
    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, player);
  }

  function testMovementRulesInvadeAsteroid() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Asteroid);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Must only invade a motherlode"));
    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, to);
  }

  function testMovementRulesRaidYourself() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Asteroid);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, player);
    vm.expectRevert(bytes("[SendUnits] Cannot raid yourself"));
    world.sendUnits(arrivalUnits, ESendType.Raid, originPosition, destinationPosition, player);
  }

  function testMovementRulesRaidNobody() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Asteroid);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Cannot raid yourself"));
    world.sendUnits(arrivalUnits, ESendType.Raid, originPosition, destinationPosition, bytes32(0));
  }

  function testMovementRulesRaidMotherlode() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Motherlode);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only raid an asteroid"));
    world.sendUnits(arrivalUnits, ESendType.Raid, originPosition, destinationPosition, to);
  }

  function testMovementRulesReinforceNonOwner() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Motherlode);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only reinforce motherlode current owner"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, addressToEntity(bob));
  }

  function testMovementRulesReinforceNobody() public {
    prepareTestMovementRules();

    RockType.set(destination, ERock.Motherlode);
    RockType.set(origin, ERock.Asteroid);
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only reinforce motherlode current owner"));
    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, bytes32(0));
  }

  function setupValidInvade() public {
    RockType.set(origin, ERock.Asteroid);
    RockType.set(destination, ERock.Motherlode);
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    ResourceCount.set(player, EResource.U_MaxMoves, 10);
    OwnedBy.set(origin, player);
  }

  /*

_sendUnits Function
Test with different origin and destination.
Test various unit types and counts.
Check if units are deducted correctly.
Check if arrival is created successfully.

Send Types
Test with different ESendType (Invade, Raid, Reinforce).
Test reinforcing yourself and not yourself.
Test invading only a motherlode.
Test raiding only an asteroid.

Public sendUnits Function
Test with different valid and invalid inputs.
Check if it triggers _sendUnits correctly.

*/
  function testSendUnitsNoUnits() public {
    setupValidInvade();
    vm.expectRevert(bytes("[LibSend] No units sent"));
    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, bytes32(0));
  }

  function testSendUnitsInvalidUnits() public {
    setupValidInvade();
    arrivalUnits.push(ArrivalUnit(EUnit.NULL, 1));
    vm.expectRevert(bytes("[SendUnits] Unit type invalid"));
    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, bytes32(0));
  }

  function testSendUnitsNotEnoughUnits() public {
    setupValidInvade();
    arrivalUnits.push(ArrivalUnit(unit, 1));
    vm.expectRevert(bytes("[SendUnits] Not enough units to send"));
    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, bytes32(0));
  }

  function testSendUnitsInvadeEmpty() public {
    setupValidInvade();
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 1, unitData);

    arrivalUnits.push(ArrivalUnit(unit, 1));

    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, bytes32(0));

    assertEq(ArrivalsSet.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    bytes32[] memory unitTypes = new bytes32[](1);
    unitTypes[0] = unitPrototype;
    uint256[] memory unitCounts = new uint256[](1);
    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: LibSend.getArrivalBlock(originPosition, destinationPosition, player, unitTypes),
      from: player,
      to: bytes32(0),
      origin: origin,
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    Arrival memory arrival = ArrivalsSet.getAll(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsInvadeEnemy() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 1, unitData);

    arrivalUnits.push(ArrivalUnit(unit, 1));

    world.sendUnits(arrivalUnits, ESendType.Invade, originPosition, destinationPosition, to);

    assertEq(ArrivalsSet.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    bytes32[] memory unitTypes = new bytes32[](1);
    unitTypes[0] = unitPrototype;
    uint256[] memory unitCounts = new uint256[](1);
    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: LibSend.getArrivalBlock(originPosition, destinationPosition, player, unitTypes),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    Arrival memory arrival = ArrivalsSet.getAll(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsReinforceSelf() public {
    setupValidInvade();
    OwnedBy.set(destination, player);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 1, unitData);

    arrivalUnits.push(ArrivalUnit(unit, 1));

    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, player);

    assertEq(ArrivalsSet.size(player, destination), 1);
    assertEq(ArrivalCount.get(player), 1);

    bytes32[] memory unitTypes = new bytes32[](1);
    unitTypes[0] = unitPrototype;
    uint256[] memory unitCounts = new uint256[](1);
    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Reinforce,
      arrivalBlock: LibSend.getArrivalBlock(originPosition, destinationPosition, player, unitTypes),
      from: player,
      to: player,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    Arrival memory arrival = ArrivalsSet.getAll(player, destination)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsReinforceOther() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 1, unitData);

    arrivalUnits.push(ArrivalUnit(unit, 1));

    world.sendUnits(arrivalUnits, ESendType.Reinforce, originPosition, destinationPosition, to);

    assertEq(ArrivalsSet.size(to, destination), 1);
    assertEq(ArrivalCount.get(player), 1);

    bytes32[] memory unitTypes = new bytes32[](1);
    unitTypes[0] = unitPrototype;
    uint256[] memory unitCounts = new uint256[](1);
    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Reinforce,
      arrivalBlock: LibSend.getArrivalBlock(originPosition, destinationPosition, player, unitTypes),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    Arrival memory arrival = ArrivalsSet.getAll(to, destination)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsRaidOther() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    RockType.set(destination, ERock.Asteroid);

    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 1, unitData);

    arrivalUnits.push(ArrivalUnit(unit, 1));

    world.sendUnits(arrivalUnits, ESendType.Raid, originPosition, destinationPosition, to);

    assertEq(ArrivalsSet.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    bytes32[] memory unitTypes = new bytes32[](1);
    unitTypes[0] = unitPrototype;
    uint256[] memory unitCounts = new uint256[](1);
    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Raid,
      arrivalBlock: LibSend.getArrivalBlock(originPosition, destinationPosition, player, unitTypes),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    Arrival memory arrival = ArrivalsSet.getAll(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }
}
