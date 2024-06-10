import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useCore } from "@/react/hooks/useCore";

/**
 * Retrieves the asteroids owned by a player entity.
 *
 * @param playerEntity - The player entity.
 * @returns An array of entities representing the asteroids owned by the player.
 */
export const usePlayerAsteroids = (playerEntity: Entity) => {
  const { tables } = useCore();

  const query = [HasValue(tables.OwnedBy, { value: playerEntity }), Has(tables.Asteroid)];
  return useEntityQuery(query);
};
