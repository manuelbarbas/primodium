import { Entity } from "@latticexyz/recs";
import { useMud } from "@/hooks/useMud";

export const usePlayerOwner = (entity: Entity) => {
  const { components } = useMud();

  const isFleet = components.IsFleet.use(entity)?.value;
  const owner = components.OwnedBy.use(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return components.OwnedBy.use(rockEntity as Entity)?.value as Entity | undefined;
};

export const getPlayerOwner = (entity: Entity) => {
  const { components } = useMud();

  const isFleet = components.IsFleet.get(entity)?.value;
  const owner = components.OwnedBy.get(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return components.OwnedBy.get(rockEntity as Entity)?.value as Entity | undefined;
};
