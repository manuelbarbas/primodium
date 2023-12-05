import { Entity } from "@latticexyz/recs";
import React, { useMemo } from "react";
import _ from "lodash";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useMud } from "src/hooks";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import { getBuildingLevelStorageUpgrades, transformProductionData } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceType } from "src/util/constants";
import { getRecipe } from "src/util/resource";
import { Hex } from "viem";
import { Badge } from "../core/Badge";
import { IconLabel } from "../core/IconLabel";
import { SecondaryCard } from "../core/Card";

export const RecipeDisplay: React.FC<{
  building: Entity;
  playerEntity: Entity;
}> = ({ building, playerEntity }) => {
  const recipe = getRecipe(building, 1n);

  if (recipe.length === 0)
    return (
      <div className="flex flex-col items-center gap-1 w-52">
        <Badge className="font-bold">FREE</Badge>
      </div>
    );

  return (
    <SecondaryCard className="flex flex-col items-center gap-1 w-full relative border-error/50 bg-transparent">
      <p className="font-bold absolute opacity-75 left-0 top-1/2 -translate-y-1/2 text-error text-sm ml-1">-</p>
      <div className="flex flex-wrap justify-center items-center gap-1 w-56 m-1">
        {recipe.map((resource, i) => {
          const resourceImage = ResourceImage.get(resource.id)!;
          const resourceName = getBlockTypeName(resource.id);
          return (
            <Badge key={`recipe-chunk-${i}`} className="border border-secondary/25">
              <ResourceIconTooltip
                key={resource.id + resource.type}
                playerEntity={playerEntity}
                image={resourceImage}
                resource={resource.id}
                resourceType={resource.type}
                name={resourceName}
                amount={resource.amount}
                validate
                fontSize={"xs"}
                short
                direction="top"
                fractionDigits={3}
              />
            </Badge>
          );
        })}
      </div>
    </SecondaryCard>
  );
};

export const BlueprintInfo: React.FC<{
  building: Entity;
}> = ({ building }) => {
  const playerEntity = useMud().network.playerEntity;
  const rawProduction = components.P_Production.useWithKeys({ prototype: building as Hex, level: 1n });
  const production = useMemo(() => transformProductionData(rawProduction), [rawProduction]);

  const unitProduction = components.P_UnitProdTypes.useWithKeys({ prototype: building as Hex, level: 1n });
  const storageUpgrades = useMemo(() => getBuildingLevelStorageUpgrades(building, 1n), [building]);

  const hasEnough = useHasEnoughResources(getRecipe(building, 1n));

  if (!getBlockTypeName(building)) return <></>;

  return (
    <div className="flex flex-col w-full items-center">
      <div className="flex flex-col items-center w-full mt-1 h-full text-xs relative gap-1 p-1 border border-secondary/25">
        <div className="absolute top-0 w-full h-full topographic-background opacity-25" />
        <RecipeDisplay building={building} playerEntity={playerEntity} />

        <SecondaryCard className="flex flex-col items-center gap-2 p-1 w-full relative bg-transparent border-success/50">
          <p className="font-bold absolute opacity-75 left-0 top-1/2 -translate-y-1/2 text-success text-sm ml-1">+</p>
          {production.map(({ resource, amount, type }) => (
            <Badge key={`prototypeproduction-${resource}`} className="text-xs gap-2 border border-secondary/25">
              <ResourceIconTooltip
                name={getBlockTypeName(resource)}
                image={ResourceImage.get(resource) ?? ""}
                resource={resource}
                playerEntity={playerEntity}
                amount={amount}
                resourceType={type}
                short
                fontSize="xs"
                direction="top"
                fractionDigits={3}
              />
            </Badge>
          ))}
          {!!unitProduction && (
            <div className="gap-1 flex flex-wrap">
              {unitProduction?.value.map((unit) => (
                <Badge key={`unitProduction-${unit}`} className="text-xs gap-2 border border-secondary/25">
                  <IconLabel
                    className={`text-xs font-bold justify-center`}
                    imageUri={ResourceImage.get(unit as Entity) ?? ""}
                    tooltipDirection={"top"}
                    tooltipText={getBlockTypeName(unit as Entity)}
                    text={""}
                    hideText
                  />
                </Badge>
              ))}
            </div>
          )}
          {!!storageUpgrades.length && (
            <div className="flex flex-col items-center">
              <div className="flex flex-wrap gap-1 w-56 justify-center">
                {storageUpgrades.map(({ resource, amount }) => (
                  <Badge key={`storage-${resource}`} className="text-xs py-3 border border-secondary/25">
                    <ResourceIconTooltip
                      name={getBlockTypeName(resource)}
                      image={ResourceImage.get(resource) ?? ""}
                      resource={resource}
                      playerEntity={playerEntity}
                      amount={amount}
                      resourceType={ResourceType.Resource}
                      short
                      fontSize="xs"
                      direction="top"
                      fractionDigits={3}
                    />
                  </Badge>
                ))}
              </div>
              <p className="font-bold opacity-50 mt-1">STORAGE</p>
            </div>
          )}
        </SecondaryCard>
      </div>
      {!hasEnough && <p className="text-rose-400 animate-pulse text-xs mt-1">NOT ENOUGH RESOURCES</p>}
    </div>
  );
};
