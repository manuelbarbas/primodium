import { EntityID } from "@latticexyz/recs";
import React, { useMemo } from "react";

import {
  BackgroundImage,
  BlockIdToKey,
  ResourceImage,
} from "src/util/constants";
import { getRecipe } from "src/util/resource";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { hashAndTrimKeyEntity } from "src/util/encode";

export const BlueprintInfo: React.FC<{
  buildingType: EntityID;
}> = ({ buildingType }) => {
  const recipe = useMemo(() => {
    return getRecipe(hashAndTrimKeyEntity(buildingType, 1));
  }, [buildingType]);

  return (
    <div className="flex flex-col w-fit">
      <div className="flex flex-col justify-center items-center w-full border border-yellow-400 border-dashed ring ring-yellow-700/20 rounded-md bg-slate-900 p-2">
        <div className="relative flex items-center gap-2">
          <img
            src={
              BackgroundImage.get(buildingType) !== undefined
                ? BackgroundImage.get(buildingType)![0]
                : undefined
            }
            className="w-16 h-16 pixel-images border-2 border-cyan-700 rounded-md"
          />
          <div>
            <p className="flex items-center text-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm ">
              <b>
                {BlockIdToKey[buildingType]
                  .replace(/([A-Z]+)/g, " $1")
                  .replace(/([A-Z][a-z])/g, " $1")}
              </b>
            </p>
            <div className="relative gap-2 px-2">
              <div className="flex justify-center items-center text-sm bg-slate-900/60 px-2">
                {recipe.map((resource) => {
                  const resourceImage = ResourceImage.get(resource.id)!;
                  const resourceName = BlockIdToKey[resource.id];
                  return (
                    <ResourceIconTooltip
                      key={resource.id}
                      image={resourceImage}
                      resourceId={resource.id}
                      name={resourceName}
                      inline
                      amount={resource.amount}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
