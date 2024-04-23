import { components } from "@/network/components";
import { EntityType, Keys } from "@/util/constants";
import { Entity } from "@latticexyz/recs";
import { Hex } from "viem";

export function getColonySlotsCostMultiplier(playerEntity: Entity) {
  const maxColonySlots = components.MaxColonySlots.get(playerEntity)?.value ?? 0n;
  const multiplier = components.P_ColonySlotsConfig.get()?.multiplier ?? 1n;
  return multiplier * maxColonySlots;
}

export function getColonyShipsPlusAsteroids(playerEntity: Entity) {
  const ownedAsteroids =
    components.Keys_AsteroidSet.getWithKeys({ entity: playerEntity as Hex, key: Keys.ASTEROID as Hex })?.itemKeys ?? [];

  const ret: Array<{ type: "asteroid" | "ship" | "training"; parentEntity: Entity }> = [];
  ownedAsteroids.forEach((asteroidEntity) => {
    ret.push({ type: "asteroid", parentEntity: asteroidEntity as Entity });
    const shipsOnAsteroid =
      components.UnitCount.getWithKeys({ entity: asteroidEntity as Hex, unit: EntityType.ColonyShip as Hex })?.value ??
      0n;
    for (let j = 0; j < shipsOnAsteroid; j++) ret.push({ type: "ship", parentEntity: asteroidEntity as Entity });

    // Fleets are owned by asteroids
    const ownedFleets =
      components.Keys_FleetSet.getWithKeys({ entity: asteroidEntity as Hex, key: Keys.FLEET_OWNED_BY as Hex })
        ?.itemKeys ?? [];
    for (let j = 0; j < ownedFleets.length; j++) {
      const shipsOnFleet =
        components.UnitCount.getWithKeys({ entity: ownedFleets[j] as Hex, unit: EntityType.ColonyShip as Hex })
          ?.value ?? 0n;
      for (let k = 0; k < shipsOnFleet; k++) ret.push({ type: "ship", parentEntity: ownedFleets[j] as Entity });
    }

    // Colony ships being trained on each asteroid
    const shipsInTraining = components.ColonyShipsInTraining.get(asteroidEntity as Entity)?.value ?? 0n;
    for (let j = 0; j < shipsInTraining; j++) ret.push({ type: "training", parentEntity: asteroidEntity as Entity });
  });

  return ret;
}
