import { Entity } from "@latticexyz/recs";
import React, { useMemo } from "react";

import { EntitytoSpriteKey } from "@game/constants";
import _ from "lodash";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { usePrimodium } from "src/hooks/usePrimodium";
import { components } from "src/network/components";
import { getBuildingLevelStorageUpgrades, transformProductionData } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
import { Badge } from "../core/Badge";
import { IconLabel } from "../core/IconLabel";

export const RecipeDisplay: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const recipe = getRecipe(building, 1n);

  if (recipe.length === 0) return <></>;
  const spaceRock = components.Position.useWithKeys({ entity: building as Hex })?.parent as Entity | undefined;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex justify-center items-center text-sm bg-slate-800/60 p-1 border border-slate-500 rounded-md gap-2 flex-wrap w-full">
        {_.chunk(recipe, 2).map((chunk, i) => (
          <div key={`recipe-chunk-${i}`} className="flex flex-row gap-1">
            {chunk.map((resource) => {
              const resourceImage = ResourceImage.get(resource.id)!;
              const resourceName = getBlockTypeName(resource.id);
              return (
                <ResourceIconTooltip
                  key={resource.id + resource.type}
                  spaceRock={spaceRock}
                  image={resourceImage}
                  resource={resource.id}
                  resourceType={resource.type}
                  name={resourceName}
                  amount={resource.amount}
                  validate
                  fontSize={"xs"}
                  short
                  fractionDigits={3}
                />
              );
            })}
          </div>
        ))}
        <p className="text-[.6rem] opacity-50">COST</p>
      </div>
    </div>
  );
};

export const PrototypeInfo: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const { getSpriteBase64 } = usePrimodium().api().sprite;
  const rawProduction = components.P_Production.useWithKeys({ prototype: building as Hex, level: 1n });
  const production = useMemo(() => transformProductionData(rawProduction), [rawProduction]);
  const spaceRock = components.Position.useWithKeys({ entity: building as Hex })?.parent as Entity | undefined;

  const unitProduction = components.P_UnitProdTypes.useWithKeys({ prototype: building as Hex, level: 1n });
  const storageUpgrades = useMemo(() => getBuildingLevelStorageUpgrades(building, 1n), [building]);

  const hasEnough = useHasEnoughResources(getRecipe(building, 1n));

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
            {production.map(({ resource, amount, type }) => (
              <Badge
                key={`prototypeproduction-${resource}`}
                className="text-xs gap-2 bg-green-800/60 py-3 border border-green-600 rounded-md w-fit"
              >
                <ResourceIconTooltip
                  name={getBlockTypeName(resource)}
                  image={ResourceImage.get(resource) ?? ""}
                  resource={resource}
                  spaceRock={spaceRock}
                  amount={amount}
                  resourceType={type}
                  short
                  fractionDigits={3}
                />
              </Badge>
            ))}
            {!!unitProduction && (
              <Badge className="text-xs gap-2 bg-green-800/60 py-3 border border-green-600 rounded-md w-fit justify-center">
                {unitProduction?.value.map((unit) => (
                  <IconLabel
                    className={`text-xs font-bold justify-center`}
                    imageUri={ResourceImage.get(unit as Entity) ?? ""}
                    key={`unitProduction-${unit}`}
                    tooltipDirection={"bottom"}
                    tooltipText={getBlockTypeName(unit as Entity)}
                    text={""}
                    hideText
                  />
                ))}
              </Badge>
            )}
            {!!storageUpgrades.length && (
              <div className="flex flex-col text-xs gap-1 bg-green-800/60 p-2 border border-green-600 rounded-md w-fit justify-center text-center">
                Storage
                {_.chunk(storageUpgrades, 2).map((chunk, i) => (
                  <div key={`storage-chunk-${i}`} className="flex flex-row gap-1">
                    {chunk.map(({ resource, amount }) => (
                      <Badge
                        key={`storage-${resource}`}
                        className="text-xs gap-2 bg-green-800/60 py-3 border border-green-600 rounded-md w-full"
                      >
                        <ResourceIconTooltip
                          name={getBlockTypeName(resource)}
                          image={ResourceImage.get(resource) ?? ""}
                          resource={resource}
                          spaceRock={spaceRock}
                          amount={amount}
                          resourceType={ResourceType.Resource}
                          short
                          fractionDigits={3}
                        />
                      </Badge>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <p className="text-[.6rem] opacity-50">OUTPUT</p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="flex justify-center align-center border border-cyan-700 bg-slate-700 rounded-md p-1 text-sm font-bold w-full text-center">
              {getBlockTypeName(building)}
            </p>
            <div className="flex gap-1 w-full">
              {
                <div className="flex flex-col gap-1 w-18 text-xs w-full">
                  <RecipeDisplay building={building} />
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
