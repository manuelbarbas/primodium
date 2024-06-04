import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { useMud } from "@/hooks/useMud";

export const usePlayerAsteroids = (playerEntity: Entity) => {
  const { components } = useMud();

  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  return useEntityQuery(query);
};
