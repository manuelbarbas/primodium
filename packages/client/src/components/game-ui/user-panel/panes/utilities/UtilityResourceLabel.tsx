import { EntityID, EntityIndex } from "@latticexyz/recs";
import { useMemo } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import {
  LastClaimedAt,
  MaxUtility,
  OccupiedUtilityResource,
  Production,
} from "src/network/components/chainComponents";
import { BlockNumber } from "src/network/components/clientComponents";
import { ResourceImage } from "src/util/constants";

export const UtilityResourceLabel = ({
  name,
  resourceId,
  entityIndex,
}: {
  name: string;
  resourceId: EntityID;
  entityIndex?: EntityIndex;
}) => {
  const blockNumber = BlockNumber.get(undefined, { value: 0 }).value;

  const resourceCount = useResourceCount(
    OccupiedUtilityResource,
    resourceId,
    entityIndex
  );

  const maxStorage = useResourceCount(MaxUtility, resourceId, entityIndex);

  const production = useResourceCount(Production, resourceId, entityIndex);

  const lastClaimedAt = useResourceCount(
    LastClaimedAt,
    resourceId,
    entityIndex
  );

  const resourcesToClaim = useMemo(() => {
    const toClaim = (blockNumber - lastClaimedAt) * production;
    if (toClaim > maxStorage - resourceCount) return maxStorage - resourceCount;
    return toClaim;
  }, [lastClaimedAt, blockNumber]);

  const resourceIcon = ResourceImage.get(resourceId);

  if (maxStorage > 0) {
    return (
      <div className="mb-1">
        <div className="flex justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
        </div>
        <div>
          <div
            className="h-full bg-cyan-600"
            style={{ width: `${(resourceCount / maxStorage) * 100}%` }}
          />
          <div
            className="h-full bg-cyan-800"
            style={{ width: `${(resourcesToClaim / maxStorage) * 100}%` }}
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
          <p>{resourceCount}</p>
          <b>{maxStorage}</b>
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
