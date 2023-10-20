import { ComponentValue, Entity, Has, HasValue, defineComponentSystem, defineSystem, runQuery } from "@latticexyz/recs";
import { getNow } from "src/util/time";
import { getUnitTrainingTime } from "src/util/trainUnits";
import { Hex } from "viem";
import { components } from "../components";
import { BlockNumber } from "../components/clientComponents";
import { SetupResult } from "../types";
import { world } from "../world";

export function setupTrainingQueues(mud: SetupResult) {
  const playerEntity = mud.network.playerEntity;
  const { BuildingType, LastClaimedAt, OwnedBy, Position, QueueUnits, QueueItemUnits, TrainingQueue, Home } =
    components;

  function peek(queueId: Entity) {
    const queueData = TrainingQueue.get(queueId);
    if (!queueData) throw new Error("Queue not found");
    return {
      unit: queueData.units[0],
      count: queueData.counts[0],
      progress: queueData.progress[0],
      timeRemaining: queueData.timeRemaining[0],
      totalQuantity: queueData.totalQuantity[0],
    };
  }

  function dequeue(queueId: Entity) {
    const queueData = TrainingQueue.get(queueId);
    if (!queueData) return;
    if (queueData.units.length == 0) throw new Error("Training queue empty");
    if (queueData.counts.length == 1) TrainingQueue.remove(queueId);
    const unit = queueData.units.shift();
    const count = queueData.counts.shift();
    const progress = queueData.progress.shift();
    const timeRemaining = queueData.timeRemaining.shift();
    TrainingQueue.set(queueData, queueId);
    return { unit, count, progress, timeRemaining };
  }

  function updateFront(
    queueId: Entity,
    item: { unit: Entity; count: bigint; progress: bigint; timeRemaining: bigint; totalQuantity: bigint }
  ) {
    const trainingQueueData = TrainingQueue.get(queueId);
    if (!trainingQueueData || trainingQueueData.units.length == 0) throw new Error("trainingQueue empty");
    trainingQueueData.counts[0] = item.count;
    trainingQueueData.units[0] = item.unit;
    trainingQueueData.progress[0] = item.progress;
    trainingQueueData.timeRemaining[0] = item.timeRemaining;
    trainingQueueData.totalQuantity[0] = item.totalQuantity;
    TrainingQueue.set(trainingQueueData, queueId);
  }

  function size(queueId: Entity) {
    return TrainingQueue.get(queueId)?.units.length || 0;
  }

  function syncToChain(queueId: Entity) {
    const queueUnits = QueueUnits.getWithKeys({ entity: queueId as Hex });
    if (!queueUnits) return TrainingQueue.remove(queueId);
    const data: ComponentValue<typeof TrainingQueue.schema> = {
      units: [],
      counts: [],
      progress: [],
      timeRemaining: [],
      totalQuantity: [],
    };
    for (let i = 0; i < queueUnits.back - queueUnits.front; i++) {
      const value = QueueItemUnits.getWithKeys({
        entity: queueId as Hex,
        index: (queueUnits.front + BigInt(i)) as bigint,
      });
      const config = components.P_GameConfig.get();
      if (!value || !config) throw new Error("Queue item not found");
      const unitId = value.unitId as Entity;
      const owner = OwnedBy.get(queueId)?.value as Entity | undefined;
      const startTime = LastClaimedAt.get(queueId)?.value;
      if (!owner || !startTime) throw new Error("No owner");
      if (i == 0) {
        const trainingTime = getUnitTrainingTime(owner, queueId, unitId);
        const trainedUnits = (getNow() - startTime) / trainingTime;
        const timeRemaining = trainingTime - ((getNow() - startTime) % trainingTime);
        const progress = (100n * trainedUnits) / value.quantity;

        data.progress.push(progress);
        data.timeRemaining.push(timeRemaining);
        data.units.push(unitId);
        data.counts.push(value.quantity - trainedUnits);
      } else {
        data.progress.push(0n);
        data.timeRemaining.push(getUnitTrainingTime(owner, queueId, unitId));
        data.units.push(unitId);
        data.counts.push(value.quantity);
      }
      data.totalQuantity.push(value.quantity);
    }

    console.log("data:", data);
    TrainingQueue.set(data, queueId);
    updateTrainingQueue(queueId);
  }

  function updateTrainingQueue(building: Entity) {
    const owner = OwnedBy.get(building)?.value as Entity | undefined;
    const config = components.P_GameConfig.get();
    let startTime = LastClaimedAt.get(owner)?.value;
    if (!owner || !startTime || !config) return;
    let stillClaiming = size(building) != 0;
    while (stillClaiming) {
      const item = peek(building);
      const trainingTime = getUnitTrainingTime(owner, building, item.unit);
      console.log("trainingTime", trainingTime, "startTime:", startTime, "time elapsed", getNow() - startTime);
      const trainedUnits = (getNow() - startTime) / trainingTime;
      // console.log("trainedUnits:", trainedUnits, "item.count:", item.count);
      if (trainedUnits >= item.count) {
        // console.log("dequeueing because trained units is larger than item count");
        dequeue(building);
        stillClaiming = size(building) != 0;
      } else {
        // if this is here, then we don't need to dequeue.
        // only decrement the count if trained units has increment
        item.count = item.totalQuantity - trainedUnits;
        item.timeRemaining = trainingTime - ((getNow() - startTime) % trainingTime);
        item.progress = (100n * trainedUnits) / item.totalQuantity;
        updateFront(building, item);
        stillClaiming = false;
      }
      console.log("start time", startTime);
      startTime += trainingTime * trainedUnits;
      console.log("increase:", trainingTime * trainedUnits, "new start time:", startTime);
    }
  }

  // when on chain queues update, we need to update our local queues
  const updateQuery = [Has(QueueUnits)];
  defineSystem(world, updateQuery, ({ entity }) => {
    syncToChain(entity);
  });

  // update local queues each second
  defineComponentSystem(world, BlockNumber, (update) => {
    const query = [
      HasValue(Position, {
        parent: Home.get(playerEntity)?.asteroid,
      }),
      Has(BuildingType),
    ];
    const blockNumber = update?.value[0]?.value;
    if (!blockNumber) return;
    const buildings = [...runQuery(query)];
    buildings.forEach((building) => updateTrainingQueue(building));
  });
}
