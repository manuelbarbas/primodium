import {
  EntityID,
  EntityIndex,
  World,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { NetworkComponents } from "@latticexyz/std-client";

import { defineComponents } from "../network/components";

export function canBeUpgraded(
  buildingEntity: EntityID,
  world: World,
  components: NetworkComponents<ReturnType<typeof defineComponents>>
): undefined | boolean {
  const buildingID = getComponentValue(
    components.Tile,
    world.entityToIndex.get(buildingEntity)!
  );
  if (
    !hasComponent(
      components.MaxLevel,
      world.entityToIndex.get(buildingEntity) as EntityIndex
    )
  )
    return false;
  const maxLevel = getComponentValue(
    components.MaxLevel,
    world.entityToIndex.get(buildingID?.value as unknown as EntityID)!
  );

  const currentLevel = getComponentValue(
    components.BuildingLevel,
    world.entityToIndex.get(buildingEntity)!
  );
  return (currentLevel?.value as number) < (maxLevel?.value as number);
}
