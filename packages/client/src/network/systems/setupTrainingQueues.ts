import { Entity, Has, HasValue, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { getNow } from "src/util/time";
import { getUnitTrainingTime } from "src/util/trainUnits";
import { Hex } from "viem";
import { components } from "../components";
import { BlockNumber } from "../components/clientComponents";
import { SetupResult } from "../types";
import { world } from "../world";

export function setupTrainingQueues(mud: SetupResult) {
  const playerEntity = mud.network.playerEntity;
  const {
    BuildingType,
    LastClaimedAt,
    ClaimOffset,
    OwnedBy,
    Position,
    QueueUnits,
    QueueItemUnits,
    TrainingQueue,
    Home,
  } = components;

  function updateTrainingQueue(building: Entity) {
    const owner = OwnedBy.get(building)?.value as Entity | undefined;
    const config = components.P_GameConfig.get();
    let startTime = LastClaimedAt.get(building, { value: 0n }).value - ClaimOffset.get(building, { value: 0n }).value;
    if (!owner || !startTime || !config) return;
    const now = getNow();
    const queueUnits = QueueUnits.getWithKeys({
      entity: building as Hex,
    });
    if (!queueUnits) return TrainingQueue.remove(building);
    let foundUnfinished = false;
    const queue = [];
    for (let i = queueUnits.front; i < queueUnits.back; i++) {
      const item = QueueItemUnits.getWithKeys({
        entity: building as Hex,
        index: i,
      });
      if (!item) return;
      if (foundUnfinished) {
        queue.push({
          unit: item.unitId,
          count: item.quantity,
          progress: 0n,
          timeRemaining: 0n,
        });
        continue;
      }
      const trainingTime = getUnitTrainingTime(owner, building, item.unitId as Entity);
      let trainedUnits = (now - startTime) / trainingTime;

      const timeRemaining = trainingTime - ((now - startTime) % trainingTime);

      if (trainedUnits == 0n) foundUnfinished = true;
      if (trainedUnits >= item.quantity) {
        trainedUnits = item.quantity;
      } else {
        queue.push({
          unit: item.unitId,
          count: item.quantity,
          progress: (100n * trainedUnits) / item.quantity,
          timeRemaining: timeRemaining,
        });

        foundUnfinished = true;
      }
      startTime += trainingTime * trainedUnits;
    }
    console.log("queue:", queue);
    const units = queue.map((update) => update.unit as Entity);
    const counts = queue.map((update) => update.count);
    const progress = queue.map((update) => update.progress);
    const timeRemaining = queue.map((update) => update.timeRemaining);
    TrainingQueue.set({ units, counts, progress, timeRemaining }, building);
  }

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
