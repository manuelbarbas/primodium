// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../PrimodiumTest.t.sol";
import { SingletonID } from "solecs/SingletonID.sol";

import { DimensionsComponent, ID as DimensionsComponentID } from "components/DimensionsComponent.sol";

import { ArrivalsList } from "libraries/ArrivalsList.sol";
import "../../prototypes.sol";

contract ArrivalsListTest is PrimodiumTest {
  constructor() PrimodiumTest() {}

  uint256 planet = 69;

  function getArrival(uint256 id) public pure returns (Arrival memory) {
    ArrivalUnit[] memory units = new ArrivalUnit[](1);
    units[0] = ArrivalUnit(24, 34);

    Arrival memory arrival = Arrival({
      sendType: ESendType.INVADE,
      units: units,
      arrivalBlock: id,
      from: 2356789,
      to: 987,
      origin: 3456,
      destination: 23456
    });
    return arrival;
  }

  function setUp() public override {
    super.setUp();
    vm.startPrank(deployer);
  }

  function testAddu() public {
    assertEq(ArrivalsList.length(world, planet), 0);
    ArrivalsList.add(world, planet, getArrival(0));
    assertEq(ArrivalsList.length(world, planet), 1);
    Arrival memory retrieved = ArrivalsList.get(world, planet, 0);
    assertEq(retrieved, getArrival(0));
  }

  function testAddTwo() public {
    testAddu();
    ArrivalsList.add(world, planet, getArrival(1));
    ArrivalsList.add(world, planet, getArrival(2));
    assertEq(ArrivalsList.length(world, planet), 3);
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(1));
    assertEq(ArrivalsList.get(world, planet, 2), getArrival(2));
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
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(2));
  }

  function testRemoveEnd() public {
    testAddTwo();
    ArrivalsList.remove(world, planet, 2);
    assertEq(ArrivalsList.length(world, planet), 2);
    assertEq(ArrivalsList.get(world, planet, 0), getArrival(0));
    assertEq(ArrivalsList.get(world, planet, 1), getArrival(1));
  }
}
