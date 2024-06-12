import { EntityType } from "@/lib/constants";
import { Tables } from "@/lib/types";
import { createTrainingQueueUtils } from "@/utils/core/trainingQueue";
import { Entity, query } from "@primodiumxyz/reactive-tables";
import { Hex } from "viem";

type ColonyShipType =
  | { type: "asteroid"; asteroidEntity: Entity }
  | { type: "ship"; parentEntity: Entity }
  | { type: "training"; timeRemaining: bigint; shipyardEntity: Entity; asteroidEntity: Entity };

export function createColonyShipUtils(tables: Tables) {
  const { updateTrainingQueue } = createTrainingQueueUtils(tables);
  /**
   * Gets all colony ships and asteroids owned by a player
   */
  function getColonyShipsPlusAsteroids(playerEntity: Entity): Array<ColonyShipType> {
    const ownedAsteroids = query({
      withProperties: [{ table: tables.OwnedBy, properties: { value: playerEntity } }],
      with: [tables.Asteroid],
    });

    const ret: Array<ColonyShipType> = [];
    ownedAsteroids.forEach((asteroidEntity) => {
      ret.push({ type: "asteroid", asteroidEntity: asteroidEntity as Entity });
      // Colony ships being trained on each asteroid
      const shipsInTraining = tables.ColonyShipsInTraining.get(asteroidEntity as Entity)?.value ?? 0n;
      if (shipsInTraining > 0) {
        const shipyards = query({
          withProperties: [
            { table: tables.OwnedBy, properties: { value: asteroidEntity } },
            { table: tables.BuildingType, properties: { value: EntityType.Shipyard } },
          ],
        });

        shipyards.forEach((shipyardEntity) => {
          // update the training queue before calculating ships on asteroid
          updateTrainingQueue(shipyardEntity as Entity);
          const queue = tables.TrainingQueue.get(shipyardEntity as Entity);
          if (!queue || queue?.units.length == 0) return;
          ret.push({
            type: "training",
            timeRemaining: queue.timeRemaining[0],
            shipyardEntity: shipyardEntity as Entity,
            asteroidEntity: asteroidEntity as Entity,
          });
        });
      }
      const hangar = tables.Hangar.get(asteroidEntity as Entity);
      if (hangar) {
        const shipIndex = hangar.units.indexOf(EntityType.ColonyShip);
        const shipsOnAsteroid = shipIndex == -1 ? 0n : hangar.counts[shipIndex];
        for (let j = 0; j < shipsOnAsteroid; j++) ret.push({ type: "ship", parentEntity: asteroidEntity as Entity });
      }

      // Fleets are owned by asteroids
      const ownedFleets = query({
        withProperties: [{ table: tables.OwnedBy, properties: { value: asteroidEntity } }],
        with: [tables.IsFleet],
      });

      for (let j = 0; j < ownedFleets.length; j++) {
        const shipsOnFleet =
          tables.UnitCount.getWithKeys({ entity: ownedFleets[j] as Hex, unit: EntityType.ColonyShip as Hex })?.value ??
          0n;
        for (let k = 0; k < shipsOnFleet; k++) ret.push({ type: "ship", parentEntity: ownedFleets[j] as Entity });
      }
    });
    return ret;
  }

  return {
    getColonyShipsPlusAsteroids,
  };
}
