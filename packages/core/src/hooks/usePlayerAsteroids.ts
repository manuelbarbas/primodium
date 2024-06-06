import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useCore } from "@/hooks/useCore";

export const usePlayerAsteroids = (playerEntity: Entity) => {
  const { components } = useCore();

  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  return useEntityQuery(query);
};
