import { components } from "@/network/components";
import { updateTrainingQueue } from "@/network/systems/setupTrainingQueues";
import { EntityType } from "@/util/constants";
import { Entity, Has, HasValue, runQuery } from "@latticexyz/recs";
import { Hex } from "viem";

export function getColonySlotsCostMultiplier(playerEntity: Entity) {
  const maxColonySlots = components.MaxColonySlots.get(playerEntity)?.value ?? 0n;
  const multiplier = components.P_ColonySlotsConfig.get()?.multiplier ?? 1n;
  return multiplier * maxColonySlots;
}

type ColonyShipType =
  | { type: "asteroid" | "ship"; asteroidEntity: Entity }
  | { type: "training"; timeRemaining: bigint; shipyardEntity: Entity; asteroidEntity: Entity };

export function getColonyShipsPlusAsteroids(playerEntity: Entity): Array<ColonyShipType> {
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  const ownedAsteroids = runQuery(query);

  const ret: Array<ColonyShipType> = [];
  console.log("ownedAsteroids", ownedAsteroids);
  ownedAsteroids.forEach((asteroidEntity) => {
    ret.push({ type: "asteroid", asteroidEntity: asteroidEntity as Entity });
    const shipsOnAsteroid =
      components.UnitCount.getWithKeys({ entity: asteroidEntity as Hex, unit: EntityType.ColonyShip as Hex })?.value ??
      0n;
    for (let j = 0; j < shipsOnAsteroid; j++) ret.push({ type: "ship", asteroidEntity: asteroidEntity as Entity });

    // Fleets are owned by asteroids
    const fleetQuery = [HasValue(components.OwnedBy, { value: asteroidEntity }), Has(components.IsFleet)];
    const ownedFleets = [...runQuery(fleetQuery)];

    for (let j = 0; j < ownedFleets.length; j++) {
      const shipsOnFleet =
        components.UnitCount.getWithKeys({ entity: ownedFleets[j] as Hex, unit: EntityType.ColonyShip as Hex })
          ?.value ?? 0n;
      for (let k = 0; k < shipsOnFleet; k++) ret.push({ type: "ship", asteroidEntity: ownedFleets[j] as Entity });
    }

    // Colony ships being trained on each asteroid
    const shipsInTraining = components.ColonyShipsInTraining.get(asteroidEntity as Entity)?.value ?? 0n;
    if (shipsInTraining > 0) {
      const shipyards = runQuery([
        HasValue(components.OwnedBy, { value: asteroidEntity }),
        HasValue(components.BuildingType, { value: EntityType.Shipyard }),
      ]);

      shipyards.forEach((shipyardEntity) => {
        updateTrainingQueue(shipyardEntity as Entity);
        const queue = components.TrainingQueue.get(shipyardEntity as Entity);
        if (!queue || queue?.units.length == 0) return;
        console.log("pushing training ship");
        ret.push({
          type: "training",
          timeRemaining: queue.timeRemaining[0],
          shipyardEntity: shipyardEntity as Entity,
          asteroidEntity: asteroidEntity as Entity,
        });
      });
    }
  });
  return ret;
}
