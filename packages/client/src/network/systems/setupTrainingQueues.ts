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
import { BlockIdToKey } from "src/util/constants";

export function setupTrainingQueues() {
  function renderTrainingQueues(blockNumber: number, buildings: EntityID[]) {
    buildings.forEach((building) => {
      const startingIndex = UnitProductionQueueIndex.get(building)?.value;
      const queueLength = UnitProductionLastQueueIndex.get(building)?.value;
      const owner = OwnedBy.get(building)?.value;
      const lastClaimedAt = LastClaimedAt.get(building)?.value;
      const buildingType = BuildingType.get(building, {
        value: "0" as EntityID,
      })?.value;

      console.log(
        "rendering queue",
        BlockIdToKey[buildingType],
        startingIndex,
        queueLength
      );
      if (
        startingIndex == undefined ||
        queueLength == undefined ||
        !owner ||
        lastClaimedAt == undefined
      )
        return;

      const queue = [];
      let foundUnfinished = false;
      for (let i = startingIndex; i < queueLength; i++) {
        const queueIndex = i;
        const buildingQueueEntity = hashKeyEntity(building, queueIndex);
        const update = UnitProductionQueue.get(buildingQueueEntity);
        if (!update) return;
        if (foundUnfinished) {
          queue.push({ unit: update.unitEntity, progress: 0 });
          continue;
        }
        const trainingTime = getUnitTrainingTime(owner, update.unitEntity);
        const trainedUnits = (blockNumber - lastClaimedAt) / trainingTime;
        if (trainedUnits < update.count) {
          queue.push({
            unit: update.unitEntity,
            progress: trainedUnits / update.count,
          });
          foundUnfinished = true;
        }
      }
      console.log("queue", BlockIdToKey[buildingType], queue);
      const units = queue.map((update) => update.unit);
      const progress = queue.map((update) => update.progress);
      TrainingQueue.set({ units, progress }, building);
    });
  }

  function getUnitTrainingTime(player: EntityID, unit: EntityID) {
    const playerUnitEntity = hashKeyEntity(player, unit);
    const level = Level.get(playerUnitEntity, { value: 0 }).value;
    const unitLevelEntity = hashKeyEntity(unit, level);
    return P_TrainingTime.get(unitLevelEntity, { value: 0 }).value;
  }

  const query = [
    HasValue(Position, {
      parent: ActiveAsteroid.get()?.value,
    }),
    Has(BuildingType),
  ];

  defineComponentSystem(world, BlockNumber, (update) => {
    const blockNumber = update?.value[0]?.value;
    if (!blockNumber) return;
    const buildings = [...runQuery(query)].map(
      (entity) => world.entities[entity]
    );
    renderTrainingQueues(blockNumber, buildings);
  });
}
