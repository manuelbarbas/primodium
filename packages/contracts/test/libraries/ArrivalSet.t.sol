// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

/* 
encodeArrivalData and decodeArrivalData Functions

clear Function
Test to ensure all records are cleared.
Edge Cases
Test invalid or empty bytes32 for player and asteroid.
*/

import "test/PrimodiumTest.t.sol";

contract ArrivalSetTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 asteroidEntity = "asteroidEntity";
  uint256[] unitCounts;
  bytes32[] unitTypes;

  function setUp() public override {
    super.setUp();
    vm.startPrank(address(world));
    unitCounts.push(1);
    unitCounts.push(2);
    unitCounts.push(3);
    unitTypes.push("unit1");
    unitTypes.push("unit2");
    unitTypes.push("unit3");
  }

  function testAdd() public {
    Arrival memory item = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });

    assertFalse(ArrivalsSet.has(playerEntity, asteroidEntity, item));
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    assertTrue(ArrivalsSet.has(playerEntity, asteroidEntity, item));
    item.arrivalBlock = 3;
    assertFalse(ArrivalsSet.has(playerEntity, asteroidEntity, item));
    item.arrivalBlock = 2;
    assertTrue(ArrivalsSet.has(playerEntity, asteroidEntity, item));
  }

  function testSize() public {
    Arrival memory item = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 0);
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 1);
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 1);
    item.arrivalBlock = 3;
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 2);
  }

  function testGetAll() public {
    Arrival memory item = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    Arrival memory item2 = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 3,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    ArrivalsSet.add(playerEntity, asteroidEntity, item2);

    Arrival[] memory arrivals = ArrivalsSet.getAll(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 2);
    assertEq(arrivals[0], item);
    assertEq(arrivals[1], item2);
  }

  function testRemove() public {
    Arrival memory item = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    Arrival memory item2 = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 3,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    ArrivalsSet.add(playerEntity, asteroidEntity, item2);

    ArrivalsSet.remove(playerEntity, asteroidEntity, item);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 1);
    Arrival[] memory arrivals = ArrivalsSet.getAll(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 1);
    assertEq(arrivals[0], item2);

    ArrivalsSet.remove(playerEntity, asteroidEntity, item2);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 0);
    arrivals = ArrivalsSet.getAll(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 0);
  }

  function testClear() public {
    Arrival memory item = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 2,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    Arrival memory item2 = Arrival({
      sendType: ESendType.Invade,
      arrivalBlock: 3,
      from: "from",
      to: "to",
      origin: "origin",
      destination: "destination",
      unitCounts: unitCounts,
      unitTypes: unitTypes
    });
    ArrivalsSet.add(playerEntity, asteroidEntity, item);
    ArrivalsSet.add(playerEntity, asteroidEntity, item2);

    ArrivalsSet.clear(playerEntity, asteroidEntity);
    assertEq(ArrivalsSet.size(playerEntity, asteroidEntity), 0);
    Arrival[] memory arrivals = ArrivalsSet.getAll(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 0);
  }
}
