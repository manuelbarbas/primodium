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
  Level,
  OwnedBy,
  P_TrainingTime,
  Position,
  UnitProductionLastQueueIndex,
  UnitProductionQueue,
  UnitProductionQueueIndex,
} from "../components/chainComponents";
import { hashKeyEntity } from "src/util/encode";

export function setupTrainingQueues() {
  function renderTrainingQueues(blockNumber: number, buildings: EntityID[]) {
    buildings.forEach((building) => {
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
          });
          continue;
        }
        const trainingTime = getUnitTrainingTime(owner, update.unitEntity);
        let trainedUnits = (blockNumber - startTime) / trainingTime;
        if (trainedUnits > 0) {
          if (trainedUnits > update.count) {
            trainedUnits = update.count;
            foundUnfinished = queueIndex > 0;
          } else {
            queue.push({
              unit: update.unitEntity,
              count: update.count,
              progress: trainedUnits / update.count,
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
      TrainingQueue.set({ units, counts, progress }, building);
    });
  }

  function getUnitTrainingTime(player: EntityID, unit: EntityID) {
    const playerUnitEntity = hashKeyEntity(player, unit);
    const level = Level.get(playerUnitEntity, { value: 1 }).value;
    const unitLevelEntity = hashKeyEntity(unit, level);
    const time = P_TrainingTime.get(unitLevelEntity, { value: 0 }).value;

    return time;
  }

  defineComponentSystem(world, BlockNumber, (update) => {
    const query = [
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
    renderTrainingQueues(blockNumber, buildings);
  });
}
