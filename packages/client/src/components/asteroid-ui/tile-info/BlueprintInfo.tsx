import { EntityID } from "@latticexyz/recs";
import React, { useMemo } from "react";

import {
  BackgroundImage,
  BlockIdToKey,
  RESOURCE_SCALE,
  ResourceImage,
} from "src/util/constants";
import { getRecipe } from "src/util/resource";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { hashAndTrimKeyEntity, hashKeyEntity } from "src/util/encode";
import { formatNumber } from "src/util/common";
import { Account, BlockNumber } from "src/network/components/clientComponents";
import {
  Level,
  P_Production,
  P_ProductionDependencies,
} from "src/network/components/chainComponents";

export const BlueprintInfo: React.FC<{
  buildingType: EntityID;
}> = ({ buildingType }) => {
  const player = Account.use()?.value!;
  const level = Level.use(hashKeyEntity(buildingType, player), {
    value: 1,
  })?.value;
  const buildingLevelEntity = hashAndTrimKeyEntity(buildingType, level);
  const recipe = useMemo(() => {
    return getRecipe(buildingLevelEntity);
  }, [buildingType, level]);
  const { avgBlockTime } = BlockNumber.use(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const prodDependencies = P_ProductionDependencies.use(buildingLevelEntity);
  const dependencies =
    prodDependencies?.resources.map((resource, index) => ({
      resource,
      value:
        (prodDependencies.values[index] * RESOURCE_SCALE * 60) / avgBlockTime,
    })) ?? [];
  const production = P_Production.use(buildingLevelEntity);
  const productionRate =
    ((production?.resourceProductionRate ?? 0) * RESOURCE_SCALE * 60) /
    avgBlockTime;

  return (
    <div className="flex flex-col w-fit">
      <div className="flex flex-col justify-center items-center w-full border border-yellow-400 border-dashed ring ring-yellow-700/20 rounded-md bg-slate-900 p-2">
        <div className="relative flex gap-2">
          <div
            className={`relative flex flex-col text-sm items-center cursor-pointer w-16 h-12 border rounded border-cyan-400`}
          >
            <img
              src={
                BackgroundImage.get(buildingType) !== undefined
                  ? BackgroundImage.get(buildingType)![0]
                  : undefined
              }
              className={`absolute bottom-0 w-14 pixel-images rounded-md`}
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="flex justify-center align-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm font-bold w-full">
              {BlockIdToKey[buildingType]
                .replace(/([A-Z]+)/g, " $1")
                .replace(/([A-Z][a-z])/g, " $1")}
            </p>
            <div className="flex gap-2">
              {recipe.length > 0 && (
                <div className="flex flex-col gap-1 w-18 text-xs">
                  COST
                  <div className="flex justify-center items-center text-sm bg-red-800/60 p-1 border border-red-600 rounded-md gap-2">
                    {recipe.map((resource) => {
                      const resourceImage = ResourceImage.get(resource.id)!;
                      const resourceName = BlockIdToKey[resource.id];
                      return (
                        <ResourceIconTooltip
                          key={resource.id}
                          image={resourceImage}
                          resourceId={resource.id}
                          name={resourceName}
                          amount={resource.amount}
                          fontSize={"xs"}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
              {(!!production || dependencies) && (
                <div className="relative gap-1 flex flex-col w-18 gap-1 text-xs">
                  OUTPUT
                  {production && (
                    <div className="flex items-center gap-2 text-xs bg-green-800/60 p-1 border border-green-600 rounded-md">
                      <img
                        className="inline-block h-4"
                        src={ResourceImage.get(production.resourceID)}
                      ></img>
                      {formatNumber(productionRate)}/MIN
                    </div>
                  )}
                  {dependencies.map((dep) => (
                    <div className="flex items-center gap-2 text-xs bg-red-800/60 p-1 border border-red-600 rounded-md">
                      <img
                        className="inline-block h-4"
                        src={ResourceImage.get(dep.resource)}
                      ></img>
                      {formatNumber(dep.value)}/MIN
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
