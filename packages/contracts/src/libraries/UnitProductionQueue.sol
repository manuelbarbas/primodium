// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { Meta_UnitProductionQueue, Meta_UnitProductionQueueData, Value_UnitProductionQueue, Value_UnitProductionQueueData as UnitProductionQueueData } from "codegen/index.sol";

library UnitProductionQueue {
  /// @notice Enqueue unit for production
  /// @param queueId Queue identifier
  /// @param queueItem Unit to be produced
  /// todo: make custom queue type
  function enqueue(bytes32 queueId, UnitProductionQueueData memory queueItem) internal {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    Value_UnitProductionQueue.set(queueId, queueData.back, queueItem);
    Meta_UnitProductionQueue.setBack(queueId, queueData.back + 1);
    Meta_UnitProductionQueue.pushQueue(queueId, queueItem.unitId);
  }

  /// @notice Dequeue unit from production queue
  /// @param queueId Queue identifier
  /// @return Unit dequeued
  function dequeue(bytes32 queueId) internal returns (UnitProductionQueueData memory) {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    require(queueData.front < queueData.back, "Queue is empty");
    UnitProductionQueueData memory item = Value_UnitProductionQueue.get(queueId, queueData.front);
    if (queueData.front + 1 == queueData.back) reset(queueId);
    else {
      Meta_UnitProductionQueue.setFront(queueId, queueData.front + 1);
      Value_UnitProductionQueue.deleteRecord(queueId, queueData.front);
    }
    return item;
  }

  /// @notice Peek the first unit in production queue
  /// @param queueId Queue identifier
  /// @return First unit in queue
  function peek(bytes32 queueId) internal view returns (UnitProductionQueueData memory) {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    require(queueData.front < queueData.back, "Queue is empty");
    return Value_UnitProductionQueue.get(queueId, queueData.front);
  }

  /// @notice Update the first unit in the production queue
  /// @param queueId Queue identifier
  /// @param queueItem Updated unit data
  function updateFront(bytes32 queueId, UnitProductionQueueData memory queueItem) internal {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    require(queueData.front < queueData.back, "Queue is empty");
    Value_UnitProductionQueue.set(queueId, queueData.front, queueItem);
  }

  /// @notice Get the size of the production queue
  /// @param queueId Queue identifier
  /// @return Size of queue
  function size(bytes32 queueId) internal view returns (uint256) {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    if (queueData.front >= queueData.back) return 0;
    return queueData.back - queueData.front;
  }

  /// @notice Check if the production queue is empty
  /// @param queueId Queue identifier
  /// @return True if empty, false otherwise
  function isEmpty(bytes32 queueId) internal view returns (bool) {
    return size(queueId) == 0;
  }

  /// @dev Reset the queue
  /// @param queueId Queue identifier
  function reset(bytes32 queueId) private {
    Meta_UnitProductionQueueData memory queueData = Meta_UnitProductionQueue.get(queueId);
    for (uint256 i = queueData.front; i < queueData.back; i++) {
      Value_UnitProductionQueue.deleteRecord(queueId, i);
    }
    Meta_UnitProductionQueue.deleteRecord(queueId);
  }
}
