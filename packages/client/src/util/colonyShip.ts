import { components } from "@/network/components";
import { updateTrainingQueue } from "@/network/systems/setupTrainingQueues";
import { EntityType } from "@/util/constants";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Hex } from "viem";

type ColonyShipType =
  | { type: "asteroid"; asteroidEntity: Entity }
  | { type: "ship"; parentEntity: Entity }
  | { type: "training"; timeRemaining: bigint; shipyardEntity: Entity; asteroidEntity: Entity };

export function getColonyShipsPlusAsteroids(playerEntity: Entity): Array<ColonyShipType> {
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const ownedAsteroids = runQuery(query);

  const ret: Array<ColonyShipType> = [];
  ownedAsteroids.forEach((asteroidEntity) => {
    ret.push({ type: "asteroid", asteroidEntity: asteroidEntity as Entity });
    // Colony ships being trained on each asteroid
    const shipsInTraining = components.ColonyShipsInTraining.get(asteroidEntity as Entity)?.value ?? 0n;
    if (shipsInTraining > 0) {
      const shipyards = runQuery([
        HasValue(components.OwnedBy, { value: asteroidEntity }),
        HasValue(components.BuildingType, { value: EntityType.Shipyard }),
      ]);

      shipyards.forEach((shipyardEntity) => {
        // update the training queue before calculating ships on asteroid
        updateTrainingQueue(shipyardEntity as Entity);
        const queue = components.TrainingQueue.get(shipyardEntity as Entity);
        if (!queue || queue?.units.length == 0) return;
        ret.push({
          type: "training",
          timeRemaining: queue.timeRemaining[0],
          shipyardEntity: shipyardEntity as Entity,
          asteroidEntity: asteroidEntity as Entity,
        });
      });
    }
    const hangar = components.Hangar.get(asteroidEntity as Entity);
    if (hangar) {
      const shipIndex = hangar.units.indexOf(EntityType.ColonyShip);
      const shipsOnAsteroid = shipIndex == -1 ? 0n : hangar.counts[shipIndex];
      for (let j = 0; j < shipsOnAsteroid; j++) ret.push({ type: "ship", parentEntity: asteroidEntity as Entity });
    }

    // Fleets are owned by asteroids
    const fleetQuery = [HasValue(components.OwnedBy, { value: asteroidEntity }), Has(components.IsFleet)];
    const ownedFleets = [...runQuery(fleetQuery)];

    for (let j = 0; j < ownedFleets.length; j++) {
      const shipsOnFleet =
        components.UnitCount.getWithKeys({ entity: ownedFleets[j] as Hex, unit: EntityType.ColonyShip as Hex })
          ?.value ?? 0n;
      for (let k = 0; k < shipsOnFleet; k++) ret.push({ type: "ship", parentEntity: ownedFleets[j] as Entity });
    }
  });
  return ret;
}
