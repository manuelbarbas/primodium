import { EntityID, EntityIndex } from "@latticexyz/recs";

import { useAccount } from "../hooks/useAccount";
import { hashKeyEntityAndTrim } from "../util/encode";
import { NewNumberComponent } from "src/network/components/customComponents/Component";
import { world } from "src/network/world";

export default function useResourceCount(
  resourceComponent: NewNumberComponent,
  resourceId: EntityID,
  entityIndex?: EntityIndex
) {
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  let resourceKey: EntityID | undefined = undefined;
  if (entityIndex && world.entities.length > entityIndex) {
    const encodedEntityId = hashKeyEntityAndTrim(
      resourceId,
      world.entities[entityIndex]
    ) as EntityID;
    resourceKey = encodedEntityId;
  } else if (address) {
    const encodedEntityId = hashKeyEntityAndTrim(
      resourceId,
      address
    ) as EntityID;
    resourceKey = encodedEntityId.toString().toLowerCase() as EntityID;
  }

  const resource = resourceComponent.use(resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
