import { EntityID } from "@latticexyz/recs";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { formatNumber } from "src/util/common";
import { ResourceImage, ResourceType } from "src/util/constants";

export const UtilityResourceLabel = ({
  name,
  resourceId,
}: {
  name: string;
  resourceId: EntityID;
}) => {
  const { resourceCount, maxStorage, resourcesToClaim } = useFullResourceCount(
    resourceId,
    ResourceType.Utility
  );

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
          <p className="text-slate-400">{`${maxStorage} max.`}</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex justify-between items-center gap-1">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between border rounded-md border-cyan-800">
                <p className="px-1 bg-cyan-700 rounded-md rounded-r-none">
                  {formatNumber(maxStorage - resourceCount + resourcesToClaim)}
                </p>
                <b className="rounded-md rounded-l-none bg-slate-700 px-1">
                  REMAINING
                </b>
              </div>
              <div className={`flex items-center w-full h-1 rounded-md`}>
                <div
                  className="h-full bg-cyan-600 rounded-md"
                  style={{
                    width: `${
                      ((maxStorage - resourceCount + resourcesToClaim) /
                        maxStorage) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="h-full bg-gray-900 rounded-md"
                  style={{
                    width: `${
                      ((resourceCount + resourcesToClaim) / maxStorage) * 100
                    }%`,
                  }}
                ></div>
              </div>
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
