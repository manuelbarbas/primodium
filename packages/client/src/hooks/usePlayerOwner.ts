import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";

export const usePlayerOwner = (entity: Entity) => {
  const isFleet = components.IsFleet.use(entity)?.value;
  const owner = components.OwnedBy.use(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return components.OwnedBy.use(rockEntity as Entity)?.value as Entity | undefined;
};

export const getPlayerOwner = (entity: Entity) => {
  const isFleet = components.IsFleet.get(entity)?.value;
  const owner = components.OwnedBy.get(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return components.OwnedBy.get(rockEntity as Entity)?.value as Entity | undefined;
};
