import { EntityID, EntityIndex } from "@latticexyz/recs";
import { useMemo } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import {
  Item,
  StorageCapacity,
  Mine,
  LastClaimedAt,
  UnclaimedResource,
} from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";
import { ResourceImage } from "src/util/constants";

export const ResourceLabel = ({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) => {
  const blockNumber = BlockNumber.use(undefined, { value: 0 })?.value;

  const resourceCount = useResourceCount(Item, resourceId, entityIndex);

  const storageCapacity = useResourceCount(
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
    if (toClaim > storageCapacity - resourceCount)
      return storageCapacity - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (storageCapacity > 0) {
    return (
      <div className="mb-1">
        <div className="flex justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
          <p>{production ? `${production}/BLOCK` : "-"}</p>
        </div>
        <div
          className={`flex items-center bottom-0 left-1/2 -translate-x-1/2 w-full h-2 ring-2 ring-slate-900/90 crt ${
            resourceCount + resourcesToClaim === storageCapacity
              ? "animate-pulse"
              : ""
          }`}
        >
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / storageCapacity) * 100}%` }}
          />

          <div
            className="h-full bg-cyan-800"
            style={{
              width: `${(resourcesToClaim / storageCapacity) * 100}%`,
            }}
          />
          <div
            className="h-full bg-gray-900"
            style={{
              width: `${
                ((storageCapacity - resourceCount - resourcesToClaim) /
                  storageCapacity) *
                100
              }%`,
            }}
          />
        </div>
        <div className="flex justify-between">
          <p>
            {resourceCount}{" "}
            {resourcesToClaim > 0 && (
              <span className="opacity-50">(+{resourcesToClaim})</span>
            )}
          </p>
          <b>{storageCapacity}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
