// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { QueueUnits, QueueUnitsData, QueueItemUnits, QueueItemUnitsData } from "codegen/Tables.sol";

library UnitProductionQueue {
  function enqueue(bytes32 queueId, QueueItemUnitsData memory queueItem) internal {
    QueueUnits.pushQueue(queueId, queueItem.unitId);
    QueueUnitsData memory queueData = QueueUnits.get(queueId);
    QueueUnits.setBack(queueId, queueData.back + 1);
    QueueItemUnits.set(queueId, queueData.queue.length - 1, queueItem);
  }

  function dequeue(bytes32 queueId) internal returns (QueueItemUnitsData memory) {
    QueueUnitsData memory queueData = QueueUnits.get(queueId);
    require(queueData.front < queueData.back, "Queue is empty");
    QueueItemUnitsData memory item = QueueItemUnits.get(queueId, queueData.front);
    if (queueData.front + 1 == queueData.back) reset(queueId);
    else {
      QueueUnits.setFront(queueId, queueData.front + 1);
      QueueItemUnits.deleteRecord(queueId, queueData.front);
    }
    return item;
  }

  function peek(bytes32 queueId) internal returns (QueueItemUnitsData memory) {
    QueueUnitsData memory queueData = QueueUnits.get(queueId);
    require(queueData.front < queueData.back, "Queue is empty");
    return QueueItemUnits.get(queueId, queueData.front);
  }

  function size(bytes32 queueId) internal view returns (uint256) {
    QueueUnitsData memory queueData = QueueUnits.get(queueId);
    return queueData.back - queueData.front;
  }

  function isEmpty(bytes32 queueId) internal view returns (bool) {
    return size(queueId) == 0;
  }

  function reset(bytes32 queueId) private {
    QueueUnitsData memory queueData = QueueUnits.get(queueId);
    for (uint256 i = queueData.front; i < queueData.back; i++) {
      QueueItemUnits.deleteRecord(queueId, i);
    }
    QueueUnits.deleteRecord(queueId);
  }
}
