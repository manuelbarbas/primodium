import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";

/**
 *
 * @param spaceRock the space rock to check for orbiting fleets
 * @param ownedBy  if provided, only return fleets owned by this entity
 *
 * @returns an array of fleet entities orbiting the space rock
 */
export const useOrbitingFleets = (spaceRock: Entity, ownedBy?: Entity) => {
  const { tables } = useCore();

  const time = tables.Time.use()?.value ?? 0n;
  const entities = useEntityQuery([Has(tables.IsFleet), HasValue(tables.FleetMovement, { destination: spaceRock })]);
  return useMemo(
    () =>
      entities.filter((entity) => {
        const arrivalTime = tables.FleetMovement.get(entity)?.arrivalTime ?? 0n;
        if (arrivalTime > time) return false;

        if (!ownedBy) return true;
        const fleetOwnerRock = tables.OwnedBy.get(entity)?.value;
        if (!fleetOwnerRock) return false;
        const rockOwner = tables.OwnedBy.get(fleetOwnerRock as Entity)?.value;
        return rockOwner === ownedBy;
      }),
    [entities, ownedBy, time]
  );
};
