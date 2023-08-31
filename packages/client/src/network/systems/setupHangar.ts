import {
  EntityID,
  Has,
  HasValue,
  defineComponentSystem,
  runQuery,
} from "@latticexyz/recs";
import { BlockNumber, Hangar, Send } from "../components/clientComponents";
import { world } from "../world";
import {
  BuildingType,
  LastClaimedAt,
  OwnedBy,
  P_IsUnit,
  Position,
  UnitProductionLastQueueIndex,
  UnitProductionQueue,
  UnitProductionQueueIndex,
  Units,
} from "../components/chainComponents";
import { hashEntities, hashKeyEntity } from "src/util/encode";
import { getUnitTrainingTime } from "src/util/trainUnits";

export function setupHangar() {
  function getTrainedUnclaimedUnits(
    units: Map<EntityID, number>,
    blockNumber: number,
    spaceRock: EntityID
  ) {
    const query = [
      Has(UnitProductionQueueIndex),
      Has(UnitProductionLastQueueIndex),
      Has(LastClaimedAt),
      HasValue(Position, {
        parent: spaceRock,
      }),
      Has(BuildingType),
    ];
    const buildings = runQuery(query);
    buildings.forEach((rawBuilding) => {
      const building = world.entities[rawBuilding];
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
      for (let i = startingIndex; i <= finalIndex; i++) {
        const buildingQueueEntity = hashKeyEntity(building, i);
        const update = UnitProductionQueue.get(buildingQueueEntity);
        if (!update) return;

        const trainingTime = getUnitTrainingTime(
          owner,
          building,
          update.unitEntity
        );
        let trainedUnits = Math.floor((blockNumber - startTime) / trainingTime);
        if (trainedUnits == 0) return;

        if (trainedUnits > update.count) {
          trainedUnits = update.count;
        }
        const prev = units.get(update.unitEntity) || 0;
        units.set(update.unitEntity, prev + trainedUnits);

        startTime += trainingTime * trainedUnits;
      }
    });
  }
  function setupHangar(blockNumber: number, spaceRock: EntityID) {
    const player = OwnedBy.get(spaceRock)?.value;
    if (!player) return;
    const units: Map<EntityID, number> = new Map();

    // get all units and find their counts on the space rock
    P_IsUnit.getAll().forEach((entity) => {
      const hashedEntity = hashEntities(entity, player, spaceRock);
      const unitCount = Units.get(hashedEntity)?.value;
      if (!unitCount) return;
      const prev = units.get(entity) || 0;
      units.set(entity, prev + unitCount);
    });

    getTrainedUnclaimedUnits(units, blockNumber, spaceRock);

    Hangar.set(
      {
        units: [...units.keys()],
        counts: [...units.values()],
      },
      spaceRock
    );
  }
  defineComponentSystem(world, Send, () => {
    const blockNumber = BlockNumber.get()?.value;
    if (!blockNumber) return;
    const origin = Send.getOrigin()?.entity;
    const destination = Send.getDestination()?.entity;
    if (origin) setupHangar(blockNumber, origin);
    if (destination) setupHangar(blockNumber, destination);
  });

  defineComponentSystem(world, BlockNumber, ({ value: [rawBlockNumber] }) => {
    if (!rawBlockNumber) return;
    const blockNumber = rawBlockNumber.value;
    const origin = Send.getOrigin()?.entity;
    const destination = Send.getDestination()?.entity;
    if (origin) setupHangar(blockNumber, origin);
    if (destination) setupHangar(blockNumber, destination);
  });
}
