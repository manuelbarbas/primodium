import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { components } from "src/network/components";

export const usePlayerAsteroids = (playerEntity: Entity) => {
  const query = [HasValue(components.OwnedBy, { value: playerEntity }), Has(components.Asteroid)];
  return useEntityQuery(query);
};
