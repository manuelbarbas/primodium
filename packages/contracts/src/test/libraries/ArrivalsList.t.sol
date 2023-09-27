// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { ArrivalsList } from "libraries/ArrivalsList.sol";

contract ArrivalsListTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 public planet = 69;

  function getArrival(uint256 id, uint256 timestamp) public pure returns (Arrival memory) {
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(24, 34);

    Arrival memory arrival = Arrival({
      sendType: ESendType.INVADE,
      units: units,
      arrivalBlock: id,
      from: 2356789,
      to: 987,
      origin: 3456,
      destination: 23456,
      timestamp: timestamp
    });
    return arrival;
  }
  
  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
  }

  function testAddu() public {
    assertEq(ArrivalsList.length(world, planet), 0);
    ArrivalsList.add(world, planet, getArrival(0, block.number));
    assertEq(ArrivalsList.length(world, planet), 1);
    Arrival memory retrieved = ArrivalsList.get(world, planet, 0);
    assertEq(retrieved, getArrival(0, block.number));
  }

  function testAddTwo() public {
    testAddu();
    ArrivalsList.add(world, planet, getArrival(1, block.number));
    ArrivalsList.add(world, planet, getArrival(2, block.number));
    assertEq(ArrivalsList.length(world, planet), 3);
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0, block.number));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(1, block.number));
    assertEq(ArrivalsList.get(world, planet, 2), getArrival(2, block.number));
  }

  function testRemove() public {
    testAddu();
    ArrivalsList.remove(world, planet, 0);
    assertEq(ArrivalsList.length(world, planet), 0);
  }

  function testRemoveMiddle() public {
    testAddTwo();
    ArrivalsList.remove(world, planet, 1);
    assertEq(ArrivalsList.length(world, planet), 2);
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0, block.number));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(2, block.number));
  }

  function testRemoveEnd() public {
    testAddTwo();
    ArrivalsList.remove(world, planet, 2);
    assertEq(ArrivalsList.length(world, planet), 2);
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0, block.number));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(1, block.number));
  }
}
