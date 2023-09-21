// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "test/PrimodiumTest.t.sol";

contract ArrivalsMapTest is PrimodiumTest {
  bytes32 playerEntity = "playerEntity";
  bytes32 asteroidEntity = "asteroidEntity";
  uint256[] unitCounts;
  bytes32[] unitTypes;

  function setUp() public override {
    super.setUp();
    vm.startPrank(worldAddress);
    unitCounts.push(1);
    unitCounts.push(2);
    unitCounts.push(3);
    unitTypes.push("unit1");
    unitTypes.push("unit2");
    unitTypes.push("unit3");
  }

  function testSet() public {
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

    bytes32 key = keccak256(abi.encode(item));
    assertFalse(ArrivalsMap.has(playerEntity, asteroidEntity, key));
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    assertTrue(ArrivalsMap.has(playerEntity, asteroidEntity, key));
    item.arrivalBlock = 3;
    bytes32 key2 = keccak256(abi.encode(item));
    assertFalse(ArrivalsMap.has(playerEntity, asteroidEntity, key2));
    item.arrivalBlock = 2;
    assertTrue(ArrivalsMap.has(playerEntity, asteroidEntity, key));
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
    bytes32 key = keccak256(abi.encode(item));
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 0);
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 1);
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 1);
    item.arrivalBlock = 3;
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 1);
    key = keccak256(abi.encode(item));
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 2);
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
    bytes32 key = keccak256(abi.encode(item));
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
    bytes32 key2 = keccak256(abi.encode(item2));
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    ArrivalsMap.set(playerEntity, asteroidEntity, key2, item2);

    Arrival[] memory arrivals = ArrivalsMap.values(playerEntity, asteroidEntity);
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
    bytes32 key = keccak256(abi.encode(item));
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

    bytes32 key2 = keccak256(abi.encode(item2));

    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    ArrivalsMap.set(playerEntity, asteroidEntity, key2, item2);

    ArrivalsMap.remove(playerEntity, asteroidEntity, key);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 1);
    Arrival[] memory arrivals = ArrivalsMap.values(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 1);
    assertEq(arrivals[0], item2);

    ArrivalsMap.remove(playerEntity, asteroidEntity, key2);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 0);
    arrivals = ArrivalsMap.values(playerEntity, asteroidEntity);
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
    bytes32 key = keccak256(abi.encode(item));
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
    bytes32 key2 = keccak256(abi.encode(item));
    ArrivalsMap.set(playerEntity, asteroidEntity, key, item);
    ArrivalsMap.set(playerEntity, asteroidEntity, key2, item2);

    ArrivalsMap.clear(playerEntity, asteroidEntity);
    assertEq(ArrivalsMap.size(playerEntity, asteroidEntity), 0);
    Arrival[] memory arrivals = ArrivalsMap.values(playerEntity, asteroidEntity);
    assertEq(arrivals.length, 0);
  }
}
