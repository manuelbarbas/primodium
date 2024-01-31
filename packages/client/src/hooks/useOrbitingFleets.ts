import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { components } from "src/network/components";

/**
 *
 * @param spaceRock the space rock to check for orbiting fleets
 * @param ownedBy  if provided, only return fleets owned by this entity
 *
 * @returns an array of fleet entities orbiting the space rock
 */
export const useOrbitingFleets = (spaceRock: Entity, ownedBy?: Entity) => {
  const time = components.Time.use()?.value ?? 0n;
  return useEntityQuery([
    Has(components.IsFleet),
    HasValue(components.FleetMovement, { destination: spaceRock }),
  ]).filter((entity) => {
    const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
    if (arrivalTime > time) return false;

    if (!ownedBy) return true;
    const fleetOwnerRock = components.OwnedBy.get(entity)?.value;
    console.log("fleetOwnerRock", fleetOwnerRock);
    if (!fleetOwnerRock) return false;
    const rockOwner = components.OwnedBy.get(spaceRock)?.value;
    console.log("rockOwner", rockOwner);
    return rockOwner === ownedBy;
  });
};
