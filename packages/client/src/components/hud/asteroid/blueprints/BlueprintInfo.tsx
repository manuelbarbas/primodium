import { defaultEntity, Entity } from "@primodiumxyz/reactive-tables";
import React, { memo, useMemo } from "react";
import { Badge } from "@/components/core/Badge";
import { IconLabel } from "@/components/core/IconLabel";
import { SecondaryCard } from "@/components/core/Card";
import { ResourceIconTooltip } from "@/components/shared/ResourceIconTooltip";
import { useCore, useHasEnoughResources } from "@primodiumxyz/core/react";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/image";
import { getEntityTypeName, ResourceType } from "@primodiumxyz/core";

export const RecipeDisplay: React.FC<{
  building: Entity;
  asteroid: Entity;
}> = memo(({ building, asteroid }) => {
  const { utils } = useCore();
  const recipe = utils.getRecipe(building, 1n);

  // cost of the building
  return (
    <div className="gap-1 w-full bg-transparent p-1 border-none">
      <div className="flex flex-wrap items-center gap-1 w-44">
        {recipe.length == 0 ? (
          <Badge className="bg-neutral/50">FREE</Badge>
        ) : (
          recipe.map((resource, i) => {
            return (
              <Badge key={`recipe-chunk-${i}`}>
                <ResourceIconTooltip
                  key={resource.id + resource.type}
                  spaceRock={asteroid}
                  image={EntityToResourceImage[resource.id]}
                  resource={resource.id}
                  resourceType={resource.type}
                  name={getEntityTypeName(resource.id)}
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
    </div>
  );
});

export const BlueprintInfo: React.FC<{
  building: Entity;
}> = memo(({ building }) => {
  const { tables, utils } = useCore();
  const spaceRock = tables.ActiveRock.use()?.value;
  if (!spaceRock) throw new Error("No space rock found");
  const rawProduction = tables.P_Production.useWithKeys({ prototype: building, level: 1n });
  const production = useMemo(() => utils.transformProductionData(rawProduction), [rawProduction]);

  const unitProduction = tables.P_UnitProdTypes.useWithKeys({ prototype: building, level: 1n });
  const storageUpgrades = useMemo(
    () => (building ? utils.getBuildingLevelStorageUpgrades(building, 1n) : undefined),
    [building]
  );

  const buildingName = useMemo(() => getEntityTypeName(building), [building]);

  const dimensions = useMemo(() => utils.getBuildingDimensions(building), [building]);

  const hasEnough = useHasEnoughResources(utils.getRecipe(building ?? defaultEntity, 1n), spaceRock);

  if (!building) return <div className="items-center p-0 w-full z-100 h-24">Select a building</div>;
  if (!getEntityTypeName(building)) return <></>;

  return (
    <div className="items-center p-0 w-full z-100 animate-out">
      <div className="flex flex-col items-center w-full h-full text-xs relative gap-1 ">
        <div className="absolute top-0 w-full h-full" />

        <div className="flex flex-col gap-4 p-1">
          {/* Building Name */}
          <div className="text-sm font-bold">{buildingName}</div>

          {/* Function/Effect */}
          {(!!production.length || !!unitProduction?.value?.length || !!storageUpgrades?.length) && (
            <SecondaryCard noPointerEvents className="flex flex-col p-1">
              <span className="mb-2">Effect</span>

              <div className="flex flex-col gap-1 w-56 relative bg-transparent border-none -mt-1">
                {production.map(({ resource, amount, type }) => (
                  <Badge
                    key={`prototypeproduction-${resource}`}
                    className="text-xs gap-2 bg-neutral/50 text-success/50"
                  >
                    <ResourceIconTooltip
                      name={getEntityTypeName(resource)}
                      image={EntityToResourceImage[resource]}
                      resource={resource}
                      amount={amount}
                      resourceType={type}
                      short
                      fontSize="xs"
                      direction="top"
                      fractionDigits={1}
                    />
                  </Badge>
                ))}
                {!!unitProduction && (
                  <div className="gap-1 flex flex-wrap">
                    {/* <img src="UI_defense.png" alt="Defense Icon" className="w-4 h-4 m-1" /> */}
                    <span className="text-xs text-success/50 w-full"> Unlock training of </span>

                    {unitProduction?.value.map((unit) => (
                      <Badge key={`unitProduction-${unit}`} className="text-xs gap-2 bg-neutral/50">
                        <IconLabel
                          className={`text-xs font-bold justify-center`}
                          imageUri={EntityToUnitImage[unit]}
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
                        <Badge key={`storage-${resource}`} className="text-xs bg-neutral/50 text-success/50">
                          <ResourceIconTooltip
                            name={getEntityTypeName(resource)}
                            image={EntityToResourceImage[resource]}
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
              </div>
            </SecondaryCard>
          )}

          {/* Cost */}
          <SecondaryCard noPointerEvents className="flex flex-col">
            <span>Cost</span>
            <RecipeDisplay building={building} asteroid={spaceRock} />

            {/* if not enough resources */}
            {!hasEnough && (
              <p className="text-error animate-pulse duration-2000 text-xs text-center mt-2">NOT ENOUGH RESOURCES</p>
            )}
          </SecondaryCard>

          {/* Size Tile */}
          <div className="mt-auto self-end">
            <span className="text-xs text-gray-400">
              {dimensions.width}x{dimensions.height} tiles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
