import { EntityID } from "@latticexyz/recs";
import React, { useMemo } from "react";

import {
  BackgroundImage,
  BlockIdToKey,
  ResourceImage,
} from "src/util/constants";
import Header from "./Header";
import { getRecipe } from "src/util/resource";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { HoverTile } from "src/network/components/clientComponents";

export const BlueprintInfo: React.FC<{
  buildingType: EntityID;
}> = ({ buildingType }) => {
  const hoverTile = HoverTile.use();

  const recipe = useMemo(() => {
    return getRecipe(buildingType);
  }, [buildingType]);

  return (
    <>
      <Header content={`[${hoverTile?.x ?? 0}, ${hoverTile?.y ?? 0}]`} />
      <div className="flex flex-col items-center space-y-6">
        <div className="relative border-4 border-dashed border-t-yellow-400 border-x-yellow-500 border-b-yellow-600 ring-slate-900/90 w-fit crt">
          <img
            src={BackgroundImage.get(buildingType)}
            className="w-16 h-16 pixel-images"
          />
          <p className="absolute flex items-center -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 border border-cyan-600 px-1 crt">
            <b>
              {BlockIdToKey[buildingType]
                .replace(/([A-Z]+)/g, " $1")
                .replace(/([A-Z][a-z])/g, " $1")}
            </b>
          </p>
        </div>
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
    </>
  );
};
