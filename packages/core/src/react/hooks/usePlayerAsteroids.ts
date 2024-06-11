import { Entity, useQuery } from "@primodiumxyz/reactive-tables";
import { useCore } from "@/react/hooks/useCore";

/**
 * Retrieves the asteroids owned by a player entity.
 *
 * @param playerEntity - The player entity.
 * @returns An array of entities representing the asteroids owned by the player.
 */
export const usePlayerAsteroids = (playerEntity: Entity) => {
  const { tables } = useCore();

  return useQuery({
    withProperties: [{ table: tables.OwnedBy, properties: { value: playerEntity } }],
    with: [tables.Asteroid],
  });
};
