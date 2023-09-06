import { EntityID } from "@latticexyz/recs";

import { NewNumberComponent } from "src/network/components/customComponents/ExtendedComponent";
import { useAccount } from "../hooks/useAccount";
import { hashAndTrimKeyEntity } from "../util/encode";

export default function useResourceCount(resourceComponent: NewNumberComponent, resourceId: EntityID) {
  const { address } = useAccount();

  // if provide an entityId, use as owner
  // else try to use wallet, otherwise use default index
  let resourceKey: EntityID | undefined = undefined;
  if (address) {
    const encodedEntityId = hashAndTrimKeyEntity(resourceId, address) as EntityID;
    resourceKey = encodedEntityId.toString().toLowerCase() as EntityID;
  }

  const resource = resourceComponent.use(resourceKey);

  if (resource) {
    return parseInt(resource.value.toString());
  } else {
    return 0;
  }
}
