import { EntityID, EntityIndex, World, hasComponent } from "@latticexyz/recs";
import { NetworkComponents } from "@latticexyz/std-client";
import { Coord } from "@latticexyz/utils";
import { defineComponents } from "../network/components";
export function canBeUpgraded(
  buildingEntity: EntityID,
  buildingType: EntityID,
  coords: Coord,
  world: World,
  components: NetworkComponents<ReturnType<typeof defineComponents>>
): undefined | boolean {
  console.log("reached can be upgraded");

  if (
    !hasComponent(
      components.MaxLevel,
      world.entityToIndex.get(buildingType) as EntityIndex
    ) ||
    !hasComponent(
      components.BuildingLevel,
      world.entityToIndex.get(buildingEntity) as EntityIndex
    )
  )
    return false;
  console.log("reached can be upgraded is true");
  return true;
}
