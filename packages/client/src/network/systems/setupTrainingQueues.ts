import { Entity, Has, HasValue, defineComponentSystem, namespaceWorld, runQuery } from "@latticexyz/recs";
import { getUnitTrainingTime } from "src/util/unit";
import { Hex } from "viem";
import { components } from "../components";
import { world } from "../world";

export function setupTrainingQueues() {
  const systemWorld = namespaceWorld(world, "systems");
  const { BuildingType, OwnedBy, Send } = components;

  // update local queues each second
  // todo: create a component that tracks active asteroids (to be updated each second)
  defineComponentSystem(systemWorld, components.BlockNumber, (update) => {
    const selectedRock = components.ActiveRock.get()?.value;
    const destination = Send.get()?.destination;
    const parents: string[] = [];
    if (selectedRock) parents.push(selectedRock);
    if (origin && selectedRock !== origin) parents.push(origin);
    if (destination && selectedRock !== destination) parents.push(destination);

    const queries = parents.map((parentEntity) => [
      HasValue(OwnedBy, {
        value: parentEntity,
      }),
      Has(BuildingType),
    ]);
    const blockNumber = update?.value[0]?.value;
    if (!blockNumber) return;
    const buildings = queries.reduce((acc, query) => [...acc, ...runQuery(query)], [] as Entity[]);
    buildings.forEach((building) => updateTrainingQueue(building));
  });
}

export function updateTrainingQueue(building: Entity) {
  const { LastClaimedAt, ClaimOffset, OwnedBy, Meta_UnitProductionQueue, Value_UnitProductionQueue, TrainingQueue } =
    components;
  const owner = OwnedBy.get(OwnedBy.get(building)?.value as Entity)?.value as Entity | undefined;
  const config = components.P_GameConfig.get();
  let startTime = LastClaimedAt.get(building, { value: 0n }).value - ClaimOffset.get(building, { value: 0n }).value;
  if (!owner || !startTime || !config) return;
  const now = components.Time.get()?.value ?? 0n;
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
