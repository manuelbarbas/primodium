import { Entity, Has, HasValue, defineComponentSystem, runQuery } from "@latticexyz/recs";
import { getNow } from "src/util/time";
import { getUnitTrainingTime } from "src/util/trainUnits";
import { Hex } from "viem";
import { components } from "../components";
import { world } from "../world";
// import { SetupResult } from "../types";
import { ERock } from "contracts/config/enums";
import { SetupResult } from "../types";

export function setupHangar(mud: SetupResult) {
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
    Hangar,
  } = components;

  const playerEntity = mud.network.playerEntity;

  function getTrainedUnclaimedUnits(spaceRock: Entity) {
    const units = new Map<Entity, bigint>();
    const query = [
      Has(TrainingQueue),
      HasValue(Position, {
        parent: spaceRock,
      }),
    ];
    const buildings = runQuery(query);
    const config = components.P_GameConfig.get();
    if (!config) return units;
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
      Array.from(trainedUnclaimedUnits).map(([unit, count]) => {
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
    const origin = Send.get()?.origin;
    const destination = Send.get()?.destination;
    if (origin) setupHangar(origin);
    if (destination) setupHangar(destination);
  });

  defineComponentSystem(world, components.BlockNumber, () => {
    const home = components.Home.get(playerEntity)?.asteroid;
    if (home) setupHangar(home as Entity);
    const origin = Send.get()?.origin;
    const destination = Send.get()?.destination;
    if (origin && origin != home) setupHangar(origin);
    if (destination && origin != home) setupHangar(destination);
    // maintain hangars for all player motherlodes to track mining production
    const query = [
      Has(RockType),
      HasValue(OwnedBy, { value: playerEntity }),
      HasValue(RockType, { value: ERock.Motherlode }),
    ];

    const motherlodes = runQuery(query);
    motherlodes.forEach((motherlode) => {
      setupHangar(motherlode);
    });
  });
}
