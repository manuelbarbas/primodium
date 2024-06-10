import { SPEED_SCALE } from "@/lib/constants";
import { Tables } from "@/lib/types";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";

export function createTrainingQueueUtils(tables: Tables) {
  function updateTrainingQueues(asteroid: Entity) {
    const buildings = tables.Keys_UnitFactorySet.getWithKeys({ entity: asteroid as Hex })?.value as
      | Entity[]
      | undefined;
    if (!buildings) return;
    buildings.forEach((building) => updateTrainingQueue(building));
  }

  function getUnitTrainingTime(rawPlayer: Entity, rawBuilding: Entity, rawUnit: Entity) {
    const player = rawPlayer as Hex;
    const unitEntity = rawUnit as Hex;
    const building = rawBuilding as Hex;

    const config = tables.P_GameConfig.get();
    if (!config) throw new Error("No game config found");
    const unitLevel = tables.UnitLevel.getWithKeys({ entity: player, unit: unitEntity }, { value: 0n })?.value;

    const buildingLevel = tables.Level.get(rawBuilding, { value: 1n }).value;
    const prototype = tables.BuildingType.getWithKeys({ entity: building })?.value as Hex | undefined;
    if (!prototype) throw new Error("No building type found");

    const multiplier = tables.P_UnitProdMultiplier.getWithKeys(
      {
        prototype,
        level: buildingLevel,
      },
      {
        value: 100n,
      }
    ).value;

    const rawTrainingTime = tables.P_Unit.getWithKeys({ entity: unitEntity, level: unitLevel })?.trainingTime ?? 0n;
    return (rawTrainingTime * 100n * 100n * SPEED_SCALE) / (multiplier * config.unitProductionRate * config.worldSpeed);
  }

  function updateTrainingQueue(building: Entity) {
    const { LastClaimedAt, ClaimOffset, OwnedBy, Meta_UnitProductionQueue, Value_UnitProductionQueue, TrainingQueue } =
      tables;
    const owner = OwnedBy.get(OwnedBy.get(building)?.value as Entity)?.value as Entity | undefined;
    const config = tables.P_GameConfig.get();
    let startTime = LastClaimedAt.get(building, { value: 0n }).value - ClaimOffset.get(building, { value: 0n }).value;
    if (!owner || !startTime || !config) return;
    const now = tables.Time.get()?.value ?? 0n;
    const queueUnits = Meta_UnitProductionQueue.getWithKeys({
      entity: building as Hex,
    });

    if (!queueUnits || queueUnits.back == queueUnits.front) return TrainingQueue.remove(building);
    let foundUnfinished = false;
    const queue = [];
    for (let i = queueUnits.front; i < queueUnits.back; i++) {
      const item = Value_UnitProductionQueue.getWithKeys({
        entity: building as Hex,
        index: i,
      });
      if (!item) return;
      if (foundUnfinished) {
        queue.push({
          unit: item.unitEntity,
          count: item.quantity,
          progress: 0n,
          timeRemaining: 0n,
        });
        continue;
      }
      const trainingTime = getUnitTrainingTime(owner, building, item.unitEntity as Entity);
      let trainedUnits = item.quantity;
      let timeRemaining = 0n;
      if (trainingTime > 0) {
        trainedUnits = (now - startTime) / trainingTime;
        timeRemaining = trainingTime - ((now - startTime) % trainingTime);
      }

      if (trainedUnits == 0n) foundUnfinished = true;
      if (trainedUnits >= item.quantity) {
        trainedUnits = item.quantity;
      } else {
        queue.push({
          unit: item.unitEntity,
          count: item.quantity,
          progress: (100n * trainedUnits) / item.quantity,
          timeRemaining: timeRemaining,
        });

        foundUnfinished = true;
      }
      startTime += trainingTime * trainedUnits;
    }
    const units = queue.map((update) => update.unit as Entity);
    const counts = queue.map((update) => update.count);
    const progress = queue.map((update) => update.progress);
    const timeRemaining = queue.map((update) => update.timeRemaining);
    TrainingQueue.set({ units, counts, progress, timeRemaining }, building);
  }

  return {
    updateTrainingQueues,
    updateTrainingQueue,
    getUnitTrainingTime,
  };
}
