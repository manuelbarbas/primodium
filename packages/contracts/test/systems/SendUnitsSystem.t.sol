// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

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
  uint256[unitPrototypeCount] unitCounts;

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
    player = addressToEntity(creator);
    to = addressToEntity(alice);
    P_EnumToPrototype.set(UnitKey, uint8(unit), unitPrototype);

    bytes32[] memory unitTypes = new bytes32[](unitPrototypeCount);
    unitTypes[0] = unitPrototype;
    P_UnitPrototypes.set(unitTypes);
  }

  function prepareTestMovementRules() public {
    RockType.set(origin, uint8(ERock.Asteroid));
    RockType.set(destination, uint8(ERock.Asteroid));
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    ResourceCount.set(player, U_MaxMoves, 10);
  }

  function testMovementRulesNotEnoughMoves() public {
    prepareTestMovementRules();
    ResourceCount.set(player, U_MaxMoves, 0);
    vm.expectRevert(bytes("[SendUnits] Reached max move count"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesNoOrigin() public {
    prepareTestMovementRules();
    RockType.deleteRecord(origin);
    vm.expectRevert();
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesNoDest() public {
    prepareTestMovementRules();
    RockType.deleteRecord(destination);
    vm.expectRevert();
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesSameRock() public {
    prepareTestMovementRules();

    vm.expectRevert(bytes("[SendUnits] Origin and destination cannot be the same"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, originPosition, to);
  }

  function testMovementRulesAsteroidOriginOwnerNotPlayer() public {
    prepareTestMovementRules();

    OwnedBy.set(origin, addressToEntity(bob));
    RockType.set(origin, uint8(ERock.Asteroid));
    vm.expectRevert(bytes("[SendUnits] Must move from an asteroid you own"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesDestAndOriginAreMotherlodes() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Motherlode));
    RockType.set(origin, uint8(ERock.Motherlode));
    vm.expectRevert(bytes("[SendUnits] Cannot move between motherlodes"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
  }

  function testMovementRulesInvadeYourself() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Motherlode));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(destination, player);
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Cannot invade yourself"));
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, player);
  }

  function testMovementRulesInvadeAsteroid() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Asteroid));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Must only invade a motherlode"));
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, to);
  }

  function testMovementRulesRaidYourself() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Asteroid));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, player);
    vm.expectRevert(bytes("[SendUnits] Cannot raid yourself"));
    world.sendUnits(unitCounts, ESendType.Raid, originPosition, destinationPosition, player);
  }

  function testMovementRulesRaidNobody() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Asteroid));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    vm.expectRevert(bytes("[SendUnits] Cannot raid yourself"));
    world.sendUnits(unitCounts, ESendType.Raid, originPosition, destinationPosition, bytes32(0));
  }

  function testMovementRulesRaidMotherlode() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Motherlode));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only raid an asteroid"));
    world.sendUnits(unitCounts, ESendType.Raid, originPosition, destinationPosition, to);
  }

  function testMovementRulesReinforceNonOwner() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Motherlode));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only reinforce motherlode current owner"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, addressToEntity(bob));
  }

  function testMovementRulesReinforceNobody() public {
    prepareTestMovementRules();

    RockType.set(destination, uint8(ERock.Motherlode));
    RockType.set(origin, uint8(ERock.Asteroid));
    OwnedBy.set(origin, player);
    OwnedBy.set(destination, to);

    vm.expectRevert(bytes("[SendUnits] Must only reinforce motherlode current owner"));
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, bytes32(0));
  }

  function setupValidInvade() public {
    RockType.set(origin, uint8(ERock.Asteroid));
    RockType.set(destination, uint8(ERock.Motherlode));
    ReversePosition.set(originPosition.x, originPosition.y, origin);
    ReversePosition.set(destinationPosition.x, destinationPosition.y, destination);
    ResourceCount.set(player, U_MaxMoves, 10);
    OwnedBy.set(origin, player);
  }

  function testSendUnitsNoUnits() public {
    setupValidInvade();
    vm.expectRevert(bytes("[SendUnits] No units sent"));
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, bytes32(0));
  }

  function testSendUnitsNotEnoughUnits() public {
    setupValidInvade();
    unitCounts[0] = 1;
    vm.expectRevert(bytes("[SendUnits] Not enough units to send"));
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, bytes32(0));
  }

  function testSendUnitsInvadeEmpty() public {
    setupValidInvade();
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;

    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, bytes32(0));

    assertEq(ArrivalsMap.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    // Arrival memory expectedArrival = Arrival({
    //   sendType: ESendType.Invade,
    //   arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
    //   from: player,
    //   to: bytes32(0),
    //   origin: origin,
    //   destination: destination,
    //   unitCounts: unitCounts
    // });

    // Arrival memory arrival = ArrivalsMap.values(player, origin)[0];
    // assertEq(arrival, expectedArrival);
  }

  function testSendUnitsInvadeEnemy() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;

    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, to);

    assertEq(ArrivalsMap.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

    Arrival memory arrival = ArrivalsMap.values(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsReinforceSelf() public {
    setupValidInvade();
    OwnedBy.set(destination, player);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;

    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, player);

    assertEq(ArrivalsMap.size(player, destination), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Reinforce,
      arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
      from: player,
      to: player,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

    Arrival memory arrival = ArrivalsMap.values(player, destination)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsReinforceOther() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;

    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);

    assertEq(ArrivalsMap.size(to, destination), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Reinforce,
      arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

    Arrival memory arrival = ArrivalsMap.values(to, destination)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsRaidOther() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    RockType.set(destination, uint8(ERock.Asteroid));

    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;

    world.sendUnits(unitCounts, ESendType.Raid, originPosition, destinationPosition, to);

    assertEq(ArrivalsMap.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Raid,
      arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

    Arrival memory arrival = ArrivalsMap.values(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }

  function testSendUnitsReinforceOtherGracePeriod() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;
    GracePeriod.set(to, block.timestamp + 100);
    GracePeriod.set(player, block.timestamp + 100);
    world.sendUnits(unitCounts, ESendType.Reinforce, originPosition, destinationPosition, to);
    assertEq(GracePeriod.get(to), block.timestamp + 100, "Grace period should not be reset");
    assertEq(GracePeriod.get(player), block.timestamp + 100, "Grace period should not be reset");
  }

  function testFailInvadeEnemyGracePeriod() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;
    GracePeriod.set(to, block.timestamp + 10);
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, to);

    assertEq(ArrivalsMap.size(player, origin), 1);
    assertEq(ArrivalCount.get(player), 1);

    unitCounts[0] = 1;

    Arrival memory expectedArrival = Arrival({
      sendType: ESendType.Invade,
      arrivalTime: LibSend.getArrivalTime(originPosition, destinationPosition, player, unitCounts),
      from: player,
      to: to,
      origin: origin,
      destination: destination,
      unitCounts: unitCounts
    });

    Arrival memory arrival = ArrivalsMap.values(player, origin)[0];
    assertEq(arrival, expectedArrival);
  }

  function testInvadeEnemyGracePeriod() public {
    setupValidInvade();
    OwnedBy.set(destination, to);
    UnitCount.set(player, origin, unitPrototype, 100);

    unitData.speed = 100;
    P_Unit.set(unitPrototype, 0, unitData);

    unitCounts[0] = 1;
    GracePeriod.set(player, block.timestamp + 10);
    GracePeriod.set(to, block.timestamp + 10);
    vm.warp(block.timestamp + 10);
    world.sendUnits(unitCounts, ESendType.Invade, originPosition, destinationPosition, to);

    assertEq(GracePeriod.get(player), 0, "Grace period should be reset after attack");
  }
}
