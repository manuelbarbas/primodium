import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useCore } from "@/hooks/useCore";

export const usePlayerAsteroids = (playerEntity: Entity) => {
  const { tables } = useCore();

  const query = [HasValue(tables.OwnedBy, { value: playerEntity }), Has(tables.Asteroid)];
  return useEntityQuery(query);
};
