import { EntityID, EntityIndex } from "@latticexyz/recs";
import { useMemo } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import {
  Item,
  LastClaimedAt,
  UnclaimedResource,
  MaxStorage,
  PlayerProduction,
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

  const maxStorage = useResourceCount(MaxStorage, resourceId, entityIndex);

  const production = useResourceCount(
    PlayerProduction,
    resourceId,
    entityIndex
  );

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
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [unclaimedResource, lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
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
            resourceCount + resourcesToClaim === maxStorage
              ? "animate-pulse"
              : ""
          }`}
        >
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / maxStorage) * 100}%` }}
          />

          <div
            className="h-full bg-cyan-800"
            style={{
              width: `${(resourcesToClaim / maxStorage) * 100}%`,
            }}
          />
          <div
            className="h-full bg-gray-900"
            style={{
              width: `${
                ((maxStorage - resourceCount - resourcesToClaim) / maxStorage) *
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
          <b>{maxStorage}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
