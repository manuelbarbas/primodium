import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/hooks/useCore";

/**
 *
 * @param spaceRock the space rock to check for orbiting fleets
 * @param ownedBy  if provided, only return fleets owned by this entity
 *
 * @returns an array of fleet entities orbiting the space rock
 */
export const useOrbitingFleets = (spaceRock: Entity, ownedBy?: Entity) => {
  const { components } = useCore();

  const time = components.Time.use()?.value ?? 0n;
  const entities = useEntityQuery([
    Has(components.IsFleet),
    HasValue(components.FleetMovement, { destination: spaceRock }),
  ]);
  return useMemo(
    () =>
      entities.filter((entity) => {
        const arrivalTime = components.FleetMovement.get(entity)?.arrivalTime ?? 0n;
        if (arrivalTime > time) return false;

        if (!ownedBy) return true;
        const fleetOwnerRock = components.OwnedBy.get(entity)?.value;
        if (!fleetOwnerRock) return false;
        const rockOwner = components.OwnedBy.get(fleetOwnerRock as Entity)?.value;
        return rockOwner === ownedBy;
      }),
    [entities, ownedBy, time]
  );
};
