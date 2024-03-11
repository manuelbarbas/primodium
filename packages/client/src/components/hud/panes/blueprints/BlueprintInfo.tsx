import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import React, { memo, useMemo } from "react";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useHasEnoughResources } from "src/hooks/useHasEnoughResources";
import { components } from "src/network/components";
import {
  getBuildingLevelStorageUpgrades,
  transformProductionData,
  getBuildingName,
  getBuildingDimensions,
} from "src/util/building";
import { getEntityTypeName } from "src/util/common";
import { ResourceImage, ResourceType } from "src/util/constants";
import { getRecipe } from "src/util/recipe";
import { Hex } from "viem";
import { Badge } from "../../../core/Badge";
import { Card, SecondaryCard } from "../../../core/Card";
import { IconLabel } from "../../../core/IconLabel";

export const RecipeDisplay: React.FC<{
  building: Entity;
  asteroid: Entity;
}> = memo(({ building, asteroid }) => {
  const recipe = getRecipe(building, 1n);

  // cost of the building
  return (
    <SecondaryCard className="gap-1 w-full bg-transparent p-1 border-none">
      <div className="flex flex-wrap items-center gap-1 w-44">
        {recipe.length == 0 ? (
          <Badge className="bg-transparent">FREE</Badge>
        ) : (
          recipe.map((resource, i) => {
            const resourceImage = ResourceImage.get(resource.id)!;
            const resourceName = getEntityTypeName(resource.id);
            return (
              <Badge key={`recipe-chunk-${i}`}>
                <ResourceIconTooltip
                  key={resource.id + resource.type}
                  spaceRock={asteroid}
                  image={resourceImage}
                  resource={resource.id}
                  resourceType={resource.type}
                  name={resourceName}
                  amount={resource.amount}
                  validate
                  fontSize={"xs"}
                  short
                  direction="top"
                  fractionDigits={1}
                />
              </Badge>
            );
          })
        )}
      </div>
    </SecondaryCard>
  );
});

export const BlueprintInfo: React.FC<{
  building: Entity;
}> = memo(({ building }) => {
  const spaceRock = components.ActiveRock.use()?.value;
  if (!spaceRock) throw new Error("No space rock found");
  const rawProduction = components.P_Production.useWithKeys({ prototype: building as Hex, level: 1n });
  const production = useMemo(() => transformProductionData(rawProduction), [rawProduction]);

  const unitProduction = components.P_UnitProdTypes.useWithKeys({ prototype: building as Hex, level: 1n });
  const storageUpgrades = useMemo(
    () => (building ? getBuildingLevelStorageUpgrades(building, 1n) : undefined),
    [building]
  );

  const buildingName = useMemo(() => getEntityTypeName(building), [building]);

  const dimensions = useMemo(() => getBuildingDimensions(building), [building]);

  const hasEnough = useHasEnoughResources(getRecipe(building ?? singletonEntity, 1n), spaceRock);

  if (!building) return <div className="items-center p-0 w-full z-100 h-24">Select a building</div>;
  if (!getEntityTypeName(building)) return <></>;

  return (
    <Card>
      <div className="items-center p-0 w-full z-100">
        <div className="flex flex-col items-center w-full h-full text-xs relative gap-1 ">
          <div className="absolute top-0 w-full h-full" />


          <SecondaryCard className="flex flex-col gap-4 p-1">
            {/* Building Name */}
            <div className="text-sm font-bold">{buildingName}</div>

            {/* Function/Effect */}
            <div className="flex flex-col">
              <span className="mb-2">Effect</span>

              <SecondaryCard className="flex flex-col gap-1 w-56 relative bg-transparent border-none -mt-1">
                {production.map(({ resource, amount, type }) => (
                  <Badge key={`prototypeproduction-${resource}`} className="text-xs gap-2 bg-transparent text-success/50">
                    <ResourceIconTooltip
                      name={getEntityTypeName(resource)}
                      image={ResourceImage.get(resource) ?? ""}
                      resource={resource}
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
                    <img src="UI_defense.png" alt="Defense Icon" className="w-4 h-4 m-1" />
                    <span className="text-xs text-success/50"> Unlock training of </span>
                    
                    {unitProduction?.value.map((unit) => (
                      <Badge key={`unitProduction-${unit}`} className="text-xs gap-2 bg-transparent">
                        <IconLabel
                          className={`text-xs font-bold justify-center`}
                          imageUri={ResourceImage.get(unit as Entity) ?? ""}
                          tooltipDirection={"top"}
                          tooltipText={getEntityTypeName(unit as Entity)}
                          text={""}
                          hideText
                        />
                      </Badge>
                    ))}
                  </div>
                )}
                {!!storageUpgrades?.length && (
                  <div className="flex flex-col">
                    <p className="text-left font-bold opacity-50">Increase storage</p>
                    <div className="flex flex-wrap gap-1 w-56">
                      {storageUpgrades.map(({ resource, amount }) => (
                        <Badge key={`storage-${resource}`} className="text-xs bg-transparent text-success/50">
                          <ResourceIconTooltip
                            name={getEntityTypeName(resource)}
                            image={ResourceImage.get(resource) ?? ""}
                            resource={resource}
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
                  </div>
                )}
              </SecondaryCard>

            </div>

            {/* Cost */}
            <div className="flex flex-col">
              <span>Cost</span>
              <RecipeDisplay building={building} asteroid={spaceRock} />

              {/* if not enough resources */}
              {!hasEnough && (
                <p className="text-error animate-pulse duration-2000 text-xs text-center mt-2">NOT ENOUGH RESOURCES</p>
              )}

            </div>

            {/* Size Tile */}
            <div className="mt-auto self-end">
              <span className="text-xs text-gray-400">
                {dimensions.width}x{dimensions.height} tiles
              </span>
            </div>

          </SecondaryCard>
        </div>
      </div>
    </Card>
  );
});
