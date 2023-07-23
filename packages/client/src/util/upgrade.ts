import { EntityID, World, hasComponent } from "@latticexyz/recs";
import { PrimodiumComponents } from "src/network/components";
export function canBeUpgraded(
  buildingEntity: EntityID,
  buildingType: EntityID,
  world: World,
  components: PrimodiumComponents
): undefined | boolean {
  const buildingEntityId = world.entityToIndex.get(buildingEntity);
  const buildingTypeId = world.entityToIndex.get(buildingType);
  if (!buildingEntityId || !buildingTypeId) return false;
  return (
    hasComponent(components.MaxLevel, buildingTypeId) &&
    hasComponent(components.BuildingLevel, buildingEntityId)
  );
}
