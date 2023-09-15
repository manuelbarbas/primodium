import { EntityID } from "@latticexyz/recs";
import React from "react";

import {
  BackgroundImage,
  RESOURCE_SCALE,
  ResourceImage,
  ResourceType,
} from "src/util/constants";
import { getRecipe } from "src/util/resource";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { hashAndTrimKeyEntity, hashKeyEntity } from "src/util/encode";
import { formatNumber, getBlockTypeName } from "src/util/common";
import { Account, BlockNumber } from "src/network/components/clientComponents";
import { Level, P_Production } from "src/network/components/chainComponents";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";

export const RecipeDisplay: React.FC<{
  entity: EntityID;
}> = ({ entity }) => {
  const recipe = getRecipe(entity);

  if (recipe.length === 0) return <></>;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex justify-center items-center text-sm bg-slate-800/60 p-1 border border-slate-500 rounded-md gap-2 flex-wrap w-full">
        {recipe.map((resource) => {
          const resourceImage = ResourceImage.get(resource.id)!;
          const resourceName = getBlockTypeName(resource.id);
          return (
            <ResourceIconTooltip
              key={resource.id + resource.type}
              image={resourceImage}
              resourceId={resource.id}
              resourceType={resource.type}
              name={resourceName}
              amount={resource.amount}
              scale={
                resource.type !== ResourceType.Utility ? RESOURCE_SCALE : 1
              }
              validate
              fontSize={"xs"}
            />
          );
        })}
      </div>
      <p className="text-[.6rem] opacity-50">COST</p>
    </div>
  );
};

export const BlueprintInfo: React.FC<{
  buildingType: EntityID;
}> = ({ buildingType }) => {
  const player = Account.use()?.value!;
  const level = Level.use(hashKeyEntity(buildingType, player), {
    value: 1,
  })?.value;
  const buildingLevelEntity = hashAndTrimKeyEntity(buildingType, level);
  const { avgBlockTime } = BlockNumber.get(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const production = P_Production.use(buildingLevelEntity);
  const productionRate =
    ((production?.resourceProductionRate ?? 0) * RESOURCE_SCALE * 60) /
    avgBlockTime;

  const hasEnough = useHasEnoughResources(buildingLevelEntity);

  if (!getBlockTypeName(buildingType)) return <></>;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-col justify-center items-center border border-yellow-400 border-dashed ring ring-yellow-700/20 rounded-md bg-slate-900 p-2">
        <div className="relative flex gap-2 items-center">
          <div className="flex flex-col items-center gap-2">
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
            {!!production && (
              <div className="relative flex flex-col gap-1 text-xs items-center w-24">
                {production && (
                  <>
                    <div className="flex items-center gap-2 text-xs bg-green-800/60 p-1 border border-green-600 rounded-md w-fit">
                      <img
                        className="inline-block h-4"
                        src={ResourceImage.get(production.resourceID)}
                      ></img>
                      {formatNumber(productionRate)}/MIN
                    </div>
                    <p className="text-[.6rem] opacity-50">OUTPUT</p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="flex justify-center align-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm font-bold w-full text-center">
              {getBlockTypeName(buildingType)}
            </p>
            <div className="flex gap-1 w-full">
              {
                <div className="flex flex-col gap-1 w-18 text-xs w-full">
                  <RecipeDisplay entity={buildingLevelEntity} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {!hasEnough && (
        <p className="text-rose-400 animate-pulse text-xs">
          NOT ENOUGH RESOURCES
        </p>
      )}
    </div>
  );
};
