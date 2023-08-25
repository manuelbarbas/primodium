import {
  EntityID,
  Has,
  HasValue,
  defineComponentSystem,
  runQuery,
} from "@latticexyz/recs";
import { world } from "../world";
import {
  ActiveAsteroid,
  BlockNumber,
  TrainingQueue,
} from "../components/clientComponents";
import {
  BuildingType,
  LastClaimedAt,
  OwnedBy,
  Position,
  UnitProductionLastQueueIndex,
  UnitProductionQueue,
  UnitProductionQueueIndex,
} from "../components/chainComponents";
import { hashKeyEntity } from "src/util/encode";
import { getUnitTrainingTime } from "src/util/trainUnits";

export function setupTrainingQueues() {
  function updateTrainingQueue(blockNumber: number, building: EntityID) {
    const startingIndex = UnitProductionQueueIndex.get(building)?.value;
    const finalIndex = UnitProductionLastQueueIndex.get(building)?.value;

    const owner = OwnedBy.get(building)?.value;

    let startTime = LastClaimedAt.get(building)?.value;
    if (
      startingIndex == undefined ||
      finalIndex == undefined ||
      !owner ||
      startTime == undefined
    )
      return;
    startTime = Number(startTime);
    const queue = [];
    let foundUnfinished = false;
    for (let i = startingIndex; i <= finalIndex; i++) {
      const queueIndex = i;
      const buildingQueueEntity = hashKeyEntity(building, queueIndex);
      const update = UnitProductionQueue.get(buildingQueueEntity);
      if (!update) return;
      if (foundUnfinished) {
        queue.push({
          unit: update.unitEntity,
          count: update.count,
          progress: 0,
          timeRemaining: 0,
        });
        continue;
      }
      const trainingTime = getUnitTrainingTime(
        owner,
        building,
        update.unitEntity
      );
      let trainedUnits = (blockNumber - startTime) / trainingTime;

      //temp
      let timeRemaining =
        trainingTime - ((blockNumber - startTime) % trainingTime);

      if (trainedUnits > 0) {
        if (trainedUnits > update.count) {
          trainedUnits = update.count;
          foundUnfinished = queueIndex > 0;
        } else {
          queue.push({
            unit: update.unitEntity,
            count: update.count,
            progress: trainedUnits / update.count,
            timeRemaining: timeRemaining,
          });

          foundUnfinished = true;
        }
      } else {
        foundUnfinished = true;
      }

      startTime += trainingTime * trainedUnits;
    }
    const units = queue.map((update) => update.unit);
    const counts = queue.map((update) => update.count);
    const progress = queue.map((update) => update.progress);
    const timeRemaining = queue.map((update) => update.timeRemaining);
    TrainingQueue.set({ units, counts, progress, timeRemaining }, building);
  }

  defineComponentSystem(world, BlockNumber, (update) => {
    const query = [
      Has(UnitProductionQueueIndex),
      Has(UnitProductionLastQueueIndex),
      Has(LastClaimedAt),
      HasValue(Position, {
        parent: ActiveAsteroid.get()?.value,
      }),
      Has(BuildingType),
    ];
    const blockNumber = update?.value[0]?.value;
    if (!blockNumber) return;
    const buildings = [...runQuery(query)].map(
      (entity) => world.entities[entity]
    );
    buildings.forEach((building) => updateTrainingQueue(blockNumber, building));
  });
}
