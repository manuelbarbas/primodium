// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

// Note checkMovementRules tests are in SendUnitsSystem.t.sol to verify revert statements
contract LibSendTest is PrimodiumTest {
  uint256[unitPrototypeCount] unitCounts;

  Arrival arrival =
    Arrival({
      sendType: ESendType.Invade,
      arrivalTime: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts
    });

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, mining: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
    bytes32[] memory unitTypes = new bytes32[](unitPrototypeCount);
    unitTypes[0] = "unit1";
    unitTypes[1] = "unit2";
    unitTypes[2] = "unit3";
    P_UnitPrototypes.set(unitTypes);

    arrival.unitCounts = unitCounts;
  }

  function testSendUnitsReinforce() public {
    arrival.sendType = ESendType.Reinforce;
    LibSend.sendUnits(arrival);
    assertEq(ArrivalsMap.size(arrival.from, arrival.origin), 0);
    assertEq(ArrivalsMap.size(arrival.from, arrival.destination), 0);
    assertEq(ArrivalsMap.size(arrival.to, arrival.origin), 0);
    assertEq(ArrivalsMap.size(arrival.to, arrival.destination), 1);

    assertEq(ArrivalCount.get(arrival.from), 1);
    assertEq(ArrivalCount.get(arrival.to), 0);
  }

  function testSendUnitsNonReinforce() public {
    arrival.sendType = ESendType.Invade;
    LibSend.sendUnits(arrival);
    assertEq(ArrivalsMap.size(arrival.from, arrival.origin), 1);
    assertEq(ArrivalsMap.size(arrival.from, arrival.destination), 0);
    assertEq(ArrivalsMap.size(arrival.to, arrival.origin), 0);
    assertEq(ArrivalsMap.size(arrival.to, arrival.destination), 0);

    assertEq(ArrivalCount.get(arrival.from), 1);
    assertEq(ArrivalCount.get(arrival.to), 0);
  }

  function testGetSlowestUnitSpeedSingle() public {
    unitCounts[0] = 100;
    unitData.speed = 69;
    P_Unit.set(P_UnitPrototypes.get()[0], 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, unitCounts), 69);
  }

  function testGetSlowestUnitSpeedNoCounts() public {
    unitCounts[0] = 0;
    unitData.speed = 50;
    P_Unit.set(P_UnitPrototypes.get()[0], 1, unitData);

    unitCounts[1] = 100;
    unitData.speed = 100;
    P_Unit.set(P_UnitPrototypes.get()[1], 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, unitCounts), 100);
  }

  function testGetSlowestUnitSpeed() public {
    unitCounts[0] = 1;
    unitCounts[1] = 1;
    unitCounts[2] = 1;

    unitData.speed = 100;
    P_Unit.set(P_UnitPrototypes.get()[0], 1, unitData);
    unitData.speed = 50;
    P_Unit.set(P_UnitPrototypes.get()[1], 1, unitData);
    unitData.speed = 200;
    P_Unit.set(P_UnitPrototypes.get()[2], 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, unitCounts), 50);
  }

  function testGetSlowestUnitSpeedNoSpeed() public {
    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, unitCounts), 0);
  }

  function setupArrivalLength(
    uint256 moveSpeed,
    uint256 distance,
    uint256 unitSpeed
  ) private returns (Arrival memory) {
    P_GameConfigData memory config = P_GameConfig.get();
    config.moveSpeed = moveSpeed;

    P_GameConfig.set(config);
    Position.set(arrival.origin, 0, 0, 0);
    Position.set(arrival.destination, int32(int256(distance)), 0, 0);
    uint256[unitPrototypeCount] memory counts;

    counts[0] = 100;
    unitData.speed = unitSpeed;
    P_Unit.set("unit1", 1, unitData);
    arrival.unitCounts = counts;
    return arrival;
  }

  function testGetArrivalTime(
    uint256 moveSpeed,
    uint256 distance,
    uint256 unitSpeed
  ) public {
    vm.assume(moveSpeed < 10000);
    vm.assume(distance < 10000);
    vm.assume(unitSpeed < 10000);
    vm.assume(moveSpeed > 0);
    vm.assume(distance > 0);
    vm.assume(unitSpeed > 0);

    Arrival memory testArrival = setupArrivalLength(moveSpeed, distance, unitSpeed);

    uint256 expected = block.timestamp + ((distance * 100 * 100) / (moveSpeed * unitSpeed));
    assertEq(
      LibSend.getArrivalTime(
        Position.get(testArrival.origin),
        Position.get(testArrival.destination),
        testArrival.from,
        testArrival.unitCounts
      ),
      expected
    );
  }

  function testFailGetArrivalTimeSpeedZero() public {
    vm.expectRevert();
    LibSend.getArrivalTime(
      Position.get(arrival.origin),
      Position.get(arrival.destination),
      arrival.from,
      arrival.unitCounts
    );
  }
}
