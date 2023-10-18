import { Entity, Has, HasValue, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { getNow } from "src/util/time";
import { getUnitTrainingTime } from "src/util/trainUnits";
import { ERock } from "src/util/web3/types";
import { Hex } from "viem";
import { components } from "../components";
import { Account, BlockNumber, Hangar } from "../components/clientComponents";
import { world } from "../world";

export function setupHangar() {
  const {
    TrainingQueue,
    Position,
    OwnedBy,
    P_UnitPrototypes,
    UnitCount,
    RockType,
    Send,
    LastClaimedAt,
    QueueUnits,
    QueueItemUnits,
  } = components;
  function getTrainedUnclaimedUnits(spaceRock: Entity) {
    const units = new Map<Entity, bigint>();
    const query = [
      Has(TrainingQueue),
      HasValue(Position, {
        parent: spaceRock,
      }),
    ];
    const buildings = runQuery(query);
    buildings.forEach((building) => {
      const owner = OwnedBy.get(building)?.value;

      let startTime = LastClaimedAt.get(building)?.value;

      const queueUnits = QueueUnits.getWithKeys({ entity: building as Hex });
      if (!queueUnits || !owner || !startTime) return Hangar.remove(building);
      for (let i = queueUnits.front; i <= queueUnits.back; i++) {
        const update = QueueItemUnits.getWithKeys({ entity: building as Hex, index: i });
        if (!update) continue;

        const trainingTime = getUnitTrainingTime(owner as Entity, building, update.unitId as Entity);
        let trainedUnits = (getNow() - startTime) / trainingTime;
        if (trainedUnits == 0n) return;

        if (trainedUnits > update.quantity) {
          trainedUnits = update.quantity;
        }
        units.set(update.unitId as Entity, trainedUnits);

        startTime += trainingTime * trainedUnits;
      }
    });
    return units;
  }

  function setupHangar(spaceRock: Entity) {
    const player = OwnedBy.get(spaceRock)?.value;
    if (!player) return;
    const units: Map<Entity, bigint> = new Map();

    // get all units and find their counts on the space rock
    P_UnitPrototypes.get()?.value.forEach((entity) => {
      const unitCount = UnitCount.getWithKeys({
        player: player as Hex,
        rock: spaceRock as Hex,
        unit: entity as Hex,
      })?.value;
      if (!unitCount) return;
      const prev = units.get(entity as Entity) || 0n;
      units.set(entity as Entity, prev + unitCount);
    });

    const type = RockType.get(spaceRock)?.value;

    if (type == ERock.Asteroid) {
      const trainedUnclaimedUnits = getTrainedUnclaimedUnits(spaceRock);
      Object.entries(trainedUnclaimedUnits).map(([unit, count]) => {
        units.set(unit as Entity, (units.get(unit as Entity) ?? 0n) + count);
      });
    }

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
    if (origin) setupHangar(origin);
    if (destination) setupHangar(destination);
  });

  defineComponentSystem(world, BlockNumber, () => {
    const origin = Send.getOrigin()?.entity;
    const destination = Send.getDestination()?.entity;
    if (origin) setupHangar(origin);
    if (destination) setupHangar(destination);
    // maintain hangars for all player motherlodes to track mining production
    const account = Account.get()?.value;
    if (!account) return;
    const query = [
      Has(RockType),
      HasValue(OwnedBy, { value: account }),
      HasValue(RockType, { value: ERock.Motherlode }),
    ];

    const motherlodes = runQuery(query);
    motherlodes.forEach((motherlode) => {
      setupHangar(motherlode);
    });
  });
}
