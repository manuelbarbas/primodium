import { Entity } from "@latticexyz/recs";
import { useCore } from "@/hooks/useCore";

export const usePlayerOwner = (entity: Entity) => {
  const { tables } = useCore();

  const isFleet = tables.IsFleet.use(entity)?.value;
  const owner = tables.OwnedBy.use(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return tables.OwnedBy.use(rockEntity as Entity)?.value as Entity | undefined;
};

export const getPlayerOwner = (entity: Entity) => {
  const { tables } = useCore();

  const isFleet = tables.IsFleet.get(entity)?.value;
  const owner = tables.OwnedBy.get(entity)?.value;
  const rockEntity = isFleet ? owner : entity;
  return tables.OwnedBy.get(rockEntity as Entity)?.value as Entity | undefined;
};
