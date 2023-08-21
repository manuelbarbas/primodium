import { EntityID, EntityIndex } from "@latticexyz/recs";
import { useMemo } from "react";
import useResourceCount from "src/hooks/useResourceCount";
import {
  Item,
  LastClaimedAt,
  P_MaxStorage,
  Production,
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

  const maxStorage = useResourceCount(P_MaxStorage, resourceId, entityIndex);

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
      <div className="relative flex justify-between items-center border rounded-md border-cyan-900 px-2 py-1 bg-slate-800 shadow-2xl">
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-slate-900/10 rounded-md" />
        <div className="justify-between">
          <div className="flex gap-1">
            <img className="w-4 h-4 " src={resourceIcon}></img>
            <p>{name}</p>
          </div>
          <p className="text-slate-400">
            {production ? `+ ${production}/BLOCK` : "-"}
          </p>
        </div>
        <div className="flex justify-between items-center gap-1">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between border rounded-md border-cyan-800">
              <p className="px-1 bg-cyan-700 rounded-md rounded-r-none">
                {resourceCount + resourcesToClaim}
              </p>
              <b className="rounded-md rounded-l-none bg-slate-700 px-1">
                {maxStorage}
              </b>
            </div>
            <div className={`flex items-center w-full h-1 rounded-md`}>
              <div
                className="h-full bg-cyan-600 rounded-md"
                style={{
                  width: `${
                    ((resourceCount + resourcesToClaim) / maxStorage) * 100
                  }%`,
                }}
              />

              <div
                className="h-full bg-gray-900 rounded-md"
                style={{
                  width: `${
                    ((maxStorage - resourceCount - resourcesToClaim) /
                      maxStorage) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {resourceCount + resourcesToClaim === maxStorage && (
            <div className="w-2 h-2 bg-rose-600 rounded-sm" />
          )}
        </div>
      </div>
    );
  } else {
    return <></>;
  }
};
