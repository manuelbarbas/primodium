import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";

export const usePlayerOwner = (entity: Entity) => {
  const isFleet = components.IsFleet.use(entity)?.value;
  const rockEntity = isFleet ? components.OwnedBy.get(entity)?.value : entity;
  return components.OwnedBy.use(rockEntity as Entity)?.value as Entity | undefined;
};
