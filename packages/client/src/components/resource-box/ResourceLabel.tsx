import { EntityID, EntityIndex } from "@latticexyz/recs";
import useResourceCount from "../../hooks/useResourceCount";
import { ResourceImage } from "../../util/constants";
import { useMemo } from "react";
import { BlockNumber } from "src/network/components/clientComponents";
import {
  Item,
  LastClaimedAt,
  Mine,
  StorageCapacity,
  UnclaimedResource,
} from "src/network/components/chainComponents";
import { SingletonID } from "@latticexyz/network";
export default function ResourceLabel({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) {
  const blockNumber = BlockNumber.use(SingletonID, { value: 0 }).value;

  const resourceCount = useResourceCount(Item, resourceId, entityIndex);

  const storageCount = useResourceCount(
    StorageCapacity,
    resourceId,
    entityIndex
  );

  const production = useResourceCount(Mine, resourceId, entityIndex);

  const lastClaimedAt = useResourceCount(
    LastClaimedAt,
    resourceId,
    entityIndex
  );

  const unclaimedResource = useResourceCount(
    UnclaimedResource,
    resourceId,
    entityIndex
  );

  const resourcesToClaim = useMemo(() => {
    const toClaim =
      unclaimedResource + (blockNumber - lastClaimedAt) * production;
    if (toClaim > storageCount - resourceCount)
      return storageCount - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (storageCount > 0) {
    return (
      <div className="flex mb-1">
        <p className="w-15 my-auto text-sm">{resourceCount} +</p>
        <p className="w-15 ml-1 my-auto text-sm">({resourcesToClaim}) /</p>
        <p className="w-15 ml-1 my-auto text-sm">{storageCount}</p>
        <img className="w-4 h-4 ml-2 my-auto" src={resourceIcon}></img>
        <p className="w-25 ml-2 my-auto text-sm">{name}</p>

        <p className="w-10 ml-2 my-auto text-sm">{production}</p>
      </div>
    );
  } else {
    return <></>;
  }
}
