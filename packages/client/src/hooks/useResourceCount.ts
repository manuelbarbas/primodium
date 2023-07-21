import { useMemo } from "react";

import { EntityID, EntityIndex } from "@latticexyz/recs";

import { useAccount } from "../hooks/useAccount";
import { hashKeyEntityAndTrim } from "../util/encode";
import { NumberComponent } from "src/network/components/customComponents/Component";
import { SingletonID } from "@latticexyz/network";
import { world } from "src/network/world";

export default function useResourceCount(
  resourceComponent: NumberComponent<{}>,
  resourceId: EntityID,
  entityIndex?: EntityIndex
) {
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  const resourceKey = useMemo(() => {
    if (entityIndex && world.entities.length > entityIndex) {
      return hashKeyEntityAndTrim(
        resourceId,
        world.entities[entityIndex]
      ) as EntityID;
    } else if (address) {
      return hashKeyEntityAndTrim(resourceId, address) as EntityID;
    } else {
      return SingletonID;
    }
  }, [resourceId, entityIndex, address]);

  const resource = resourceComponent.use(resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
