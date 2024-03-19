// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import "test/PrimodiumTest.t.sol";

contract UnitProductionQueueTest is PrimodiumTest {
  bytes32 queueId = "queueId";

  function setUp() public override {
    super.setUp();
    vm.startPrank(creator);
  }

  function testEnqueueItems() public {
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData("unit1", 2);
    UnitProductionQueue.enqueue(queueId, item);
    item = Value_UnitProductionQueueData("unit2", 3);
    UnitProductionQueue.enqueue(queueId, item);
    item = Value_UnitProductionQueueData("unit3", 4);
    UnitProductionQueue.enqueue(queueId, item);
    Meta_UnitProductionQueueData memory data = Meta_UnitProductionQueue.get(queueId);
    assertEq(data.back, 3);
    assertEq(data.front, 0);
    assertEq(Value_UnitProductionQueue.getQuantity(queueId, 0), 2);
    assertEq(Value_UnitProductionQueue.getQuantity(queueId, 1), 3);
    assertEq(Value_UnitProductionQueue.getQuantity(queueId, 2), 4);
  }

  function testDequeueItems() public {
    bytes32 unit1 = bytes32("unit1");
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData(unit1, 2);
    UnitProductionQueue.enqueue(queueId, item);
    item = Value_UnitProductionQueueData("unit2", 3);
    UnitProductionQueue.enqueue(queueId, item);
    Value_UnitProductionQueueData memory dequeuedItem = UnitProductionQueue.dequeue(queueId);
    assertEq(uint256(dequeuedItem.unitId), uint256(unit1));
    assertEq(UnitProductionQueue.size(queueId), 1);
    assertFalse(UnitProductionQueue.isEmpty(queueId));
  }

  function testPeekItems() public {
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData("unit1", 2);
    UnitProductionQueue.enqueue(queueId, item);
    item = Value_UnitProductionQueueData("unit2", 3);
    UnitProductionQueue.enqueue(queueId, item);

    Value_UnitProductionQueueData memory peekedItem = UnitProductionQueue.peek(queueId);
    assertEq(peekedItem.unitId, "unit1");
    assertEq(UnitProductionQueue.size(queueId), 2);
  }

  function testEmptyQueue() public {
    assertTrue(UnitProductionQueue.isEmpty(queueId));
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData("unit1", 2);
    UnitProductionQueue.enqueue(queueId, item);
    assertFalse(UnitProductionQueue.isEmpty(queueId));
  }

  function testQueueSize() public {
    assertEq(UnitProductionQueue.size(queueId), 0);
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData("unit1", 2);
    UnitProductionQueue.enqueue(queueId, item);
    assertEq(UnitProductionQueue.size(queueId), 1);
  }

  function testResetQueue() public {
    Value_UnitProductionQueueData memory item = Value_UnitProductionQueueData("unit1", 2);
    UnitProductionQueue.enqueue(queueId, item);
    UnitProductionQueue.dequeue(queueId);
    assertEq(UnitProductionQueue.size(queueId), 0);
  }

  function testFailDequeueFromEmpty() public {
    UnitProductionQueue.dequeue(queueId);
  }

  function testFailPeekFromEmpty() public {
    vm.expectRevert(bytes("Queue is empty"));
    UnitProductionQueue.peek(queueId);
  }
}
