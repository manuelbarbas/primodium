import { ComponentValue, Entity, Has, HasValue, defineComponentSystem, defineSystem, runQuery } from "@latticexyz/recs";
import { getNow } from "src/util/time";
import { getUnitTrainingTime } from "src/util/trainUnits";
import { Hex } from "viem";
import { components } from "../components";
import { BlockNumber } from "../components/clientComponents";
import { world } from "../world";
import { SetupResult } from "../types";

export function setupTrainingQueues(mud: SetupResult) {
  const playerEntity = mud.network.playerEntity;
  const { BuildingType, LastClaimedAt, OwnedBy, Position, Hangar, QueueUnits, QueueItemUnits, TrainingQueue, Home } =
    components;

  function peek(queueId: Entity) {
    const queueData = TrainingQueue.get(queueId);
    if (!queueData) throw new Error("Queue not found");
    return {
      unit: queueData.units[0],
      count: queueData.counts[0],
      progress: queueData.progress[0],
      timeRemaining: queueData.timeRemaining[0],
    };
  }

  function dequeue(queueId: Entity) {
    const queueData = TrainingQueue.get(queueId);
    if (!queueData) return;
    if (queueData.units.length == 0) throw new Error("Hangar empty");
    if (queueData.counts.length == 1) Hangar.remove(queueId);
    const unit = queueData.units.shift();
    const count = queueData.counts.shift();
    const progress = queueData.progress.shift();
    const timeRemaining = queueData.timeRemaining.shift();
    TrainingQueue.set(queueData, queueId);
    return { unit, count, progress, timeRemaining };
  }

  function updateFront(
    queueId: Entity,
    item: { unit: Entity; count: bigint; progress: number; timeRemaining: bigint }
  ) {
    const trainingQueueData = TrainingQueue.get(queueId);
    if (!trainingQueueData || trainingQueueData.units.length == 0) throw new Error("trainingQueue empty");
    trainingQueueData.counts[0] = item.count;
    trainingQueueData.units[0] = item.unit;
    trainingQueueData.progress[0] = item.progress;
    trainingQueueData.timeRemaining[0] = item.timeRemaining;
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
    };
    for (let i = 0; i < queueUnits.back - queueUnits.front; i++) {
      const value = QueueItemUnits.getWithKeys({
        entity: queueId as Hex,
        index: (queueUnits.front + BigInt(i)) as bigint,
      });
      if (!value) throw new Error("Queue item not found");
      data.units.push(value.unitId as Entity);
      data.counts.push(value.quantity);
      // if (i == 0) {
      //   const owner = OwnedBy.get(queueId)?.value as Entity | undefined;
      //   const startTime = LastClaimedAt.get(queueId)?.value;
      //   if (!owner || !startTime) throw new Error("No owner");
      //   const trainingTime = getUnitTrainingTime(owner, queueId, value.unitId as Entity);
      //   const timeRemaining = trainingTime - ((getNow() - startTime) % trainingTime);
      //   const trainedUnits = (getNow() - startTime) / trainingTime;
      //   const progress = trainedUnits / value.quantity;

      //   data.progress.push(progress);

      //   data.timeRemaining.push(timeRemaining);
      // } else {
      //   data.progress.push(0n);
      //   data.timeRemaining.push(0n);
      // }
    }

    data.progress.push(0);
    data.timeRemaining.push(0n);
    TrainingQueue.set(data, queueId);
    updateTrainingQueue(queueId);
  }

  function updateTrainingQueue(building: Entity) {
    const owner = OwnedBy.get(building)?.value as Entity | undefined;
    let startTime = LastClaimedAt.get(owner)?.value;
    if (!owner || !startTime) return;
    let stillClaiming = size(building) != 0;
    while (stillClaiming) {
      const item = peek(building);
      const trainingTime = getUnitTrainingTime(owner, building, item.unit);

      const trainedUnits = (getNow() - startTime) / trainingTime;
      if (trainedUnits == item.count) {
        dequeue(building);
        stillClaiming = size(building) != 0;
      } else {
        item.count -= trainedUnits;
        updateFront(building, item);
        stillClaiming = false;
      }
      startTime += trainingTime * trainedUnits;
    }
  }

  // when on chain queues update, we need to update our local queues
  const updateQuery = [Has(QueueUnits), Has(QueueItemUnits)];
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
