import { Entity } from "@latticexyz/recs";
import React, { useMemo } from "react";

import { primodium } from "@game/api";
import { EntitytoSpriteKey } from "@game/constants";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { transformProductionData } from "src/util/building";
import { formatNumber, getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage, ResourceType } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";

export const RecipeDisplay: React.FC<{
  building: Entity;
  playerEntity: Entity;
}> = ({ building, playerEntity }) => {
  const recipe = getRecipe(building, 1n);

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
              playerEntity={playerEntity}
              image={resourceImage}
              resource={resource.id}
              resourceType={resource.type}
              name={resourceName}
              amount={resource.amount}
              scale={resource.type !== ResourceType.Utility ? RESOURCE_SCALE : 1n}
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

export const PrototypeInfo: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const playerEntity = useMud().network.playerEntity;
  const { getSpriteBase64 } = primodium.api().sprite;
  const rawProduction = components.P_Production.useWithKeys({ prototype: building as Hex, level: 1n });
  const production = useMemo(() => transformProductionData(rawProduction), [rawProduction]);

  const hasEnough = useHasEnoughResources(getRecipe(building, 1n), playerEntity);

  if (!getBlockTypeName(building)) return <></>;

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
                  EntitytoSpriteKey[building] !== undefined
                    ? getSpriteBase64(EntitytoSpriteKey[building][0])
                    : undefined
                }
                className={`absolute bottom-0 w-14 pixel-images rounded-md`}
              />
            </div>
            {production.map(({ resource, amount }) => (
              <div
                className="relative flex flex-col gap-1 text-xs items-center w-24"
                key={`prototypeproduction-${resource}`}
              >
                {production && (
                  <>
                    <div className="flex items-center gap-2 text-xs bg-green-800/60 p-1 border border-green-600 rounded-md w-fit">
                      <img className="inline-block h-4" src={ResourceImage.get(resource)}></img>
                      {formatNumber(amount)}/MIN
                    </div>
                    <p className="text-[.6rem] opacity-50">OUTPUT</p>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="flex justify-center align-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm font-bold w-full text-center">
              {getBlockTypeName(building)}
            </p>
            <div className="flex gap-1 w-full">
              {
                <div className="flex flex-col gap-1 w-18 text-xs w-full">
                  <RecipeDisplay building={building} playerEntity={playerEntity} />
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      {!hasEnough && <p className="text-rose-400 animate-pulse text-xs">NOT ENOUGH RESOURCES</p>}
    </div>
  );
};
