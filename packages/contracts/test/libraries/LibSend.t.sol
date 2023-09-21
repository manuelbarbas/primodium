// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

// Note checkMovementRules tests are in SendUnitsSystem.t.sol to verify revert statements
contract LibSendTest is PrimodiumTest {
  uint256[] unitCounts;
  bytes32[] unitTypes;
  Arrival arrival =
    Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

  P_UnitData unitData = P_UnitData({ attack: 0, defense: 0, speed: 0, cargo: 0, mining: 0, trainingTime: 0 });

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
    unitCounts.push(1);
    unitCounts.push(2);
    unitCounts.push(3);
    unitTypes.push("unit1");
    unitTypes.push("unit2");
    unitTypes.push("unit3");
    arrival.unitCounts = unitCounts;
    arrival.unitTypes = unitTypes;
  }

  function testSendUnitsReinforce() public {
    arrival.sendType = ESendType.Reinforce;
    LibSend.sendUnits(arrival);
    assertEq(ArrivalsSet.size(arrival.from, arrival.origin), 0);
    assertEq(ArrivalsSet.size(arrival.from, arrival.destination), 0);
    assertEq(ArrivalsSet.size(arrival.to, arrival.origin), 0);
    assertEq(ArrivalsSet.size(arrival.to, arrival.destination), 1);

    assertEq(ArrivalCount.get(arrival.from), 1);
    assertEq(ArrivalCount.get(arrival.to), 0);
  }

  function testSendUnitsNonReinforce() public {
    arrival.sendType = ESendType.Invade;
    LibSend.sendUnits(arrival);
    assertEq(ArrivalsSet.size(arrival.from, arrival.origin), 1);
    assertEq(ArrivalsSet.size(arrival.from, arrival.destination), 0);
    assertEq(ArrivalsSet.size(arrival.to, arrival.origin), 0);
    assertEq(ArrivalsSet.size(arrival.to, arrival.destination), 0);

    assertEq(ArrivalCount.get(arrival.from), 1);
    assertEq(ArrivalCount.get(arrival.to), 0);
  }

  function testGetSlowestUnitSpeedSingle() public {
    uint256[] memory counts = new uint256[](1);
    bytes32[] memory types = new bytes32[](1);

    counts[0] = 100;
    types[0] = "unit1";
    unitData.speed = 69;
    P_Unit.set("unit1", 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, types), 69);
  }

  function testGetSlowestUnitSpeedNoCounts() public {
    uint256[] memory counts = new uint256[](2);
    bytes32[] memory types = new bytes32[](2);

    counts[0] = 0;
    types[0] = "unit1";
    unitData.speed = 50;
    P_Unit.set("unit1", 1, unitData);

    counts[1] = 100;
    types[1] = "unit2";
    unitData.speed = 100;
    P_Unit.set("unit2", 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, types), 100);
  }

  function testGetSlowestUnitSpeed() public {
    unitData.speed = 100;
    P_Unit.set("unit1", 1, unitData);
    unitData.speed = 50;
    P_Unit.set("unit2", 1, unitData);
    unitData.speed = 200;
    P_Unit.set("unit3", 1, unitData);

    assertEq(LibSend.getSlowestUnitSpeed(arrival.from, unitTypes), 50);
  }

  function testFailGetSlowestUnitSpeedNoUnits() public view {
    LibSend.getSlowestUnitSpeed(arrival.from, new bytes32[](0));
  }

  function testFailGetSlowestUnitSpeedNoSpeed() public view {
    LibSend.getSlowestUnitSpeed(arrival.from, unitTypes);
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
    uint256[] memory counts = new uint256[](1);
    bytes32[] memory types = new bytes32[](1);

    counts[0] = 100;
    types[0] = "unit1";
    unitData.speed = unitSpeed;
    P_Unit.set("unit1", 1, unitData);
    arrival.unitCounts = counts;
    arrival.unitTypes = types;
    return arrival;
  }

  function testGetArrivalBlock(
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
      LibSend.getArrivalBlock(
        Position.get(testArrival.origin),
        Position.get(testArrival.destination),
        testArrival.from,
        testArrival.unitTypes
      ),
      expected
    );
  }

  function testFailGetArrivalBlockSpeedZero() public {
    vm.expectRevert();
    LibSend.getArrivalBlock(
      Position.get(arrival.origin),
      Position.get(arrival.destination),
      arrival.from,
      arrival.unitTypes
    );
  }
}
