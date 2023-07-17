import { EntityID, World, hasComponent } from "@latticexyz/recs";
import { NetworkComponents } from "@latticexyz/std-client";
import { defineComponents } from "../network/components";
export function canBeUpgraded(
  buildingEntity: EntityID,
  buildingType: EntityID,
  world: World,
  components: NetworkComponents<ReturnType<typeof defineComponents>>
): undefined | boolean {
  const buildingEntityId = world.entityToIndex.get(buildingEntity);
  const buildingTypeId = world.entityToIndex.get(buildingType);
  if (!buildingEntityId || !buildingTypeId) return false;
  return (
    hasComponent(components.MaxLevel, buildingTypeId) &&
    hasComponent(components.BuildingLevel, buildingEntityId)
  );
}
