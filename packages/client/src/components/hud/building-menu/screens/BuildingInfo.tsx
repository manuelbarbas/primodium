import { EntityID } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useBuildingInfo } from "src/hooks/useBuildingInfo";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceCategory, RESOURCE_SCALE } from "src/util/constants";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const BuildingInfo: React.FC<{ building: EntityID }> = ({ building }) => {
  const { buildingType, level, maxLevel, position, production, upgrade, unitProductionMultiplier, storages } =
    useBuildingInfo(building);

  return (
    <Navigator.Screen title="BuildingInfo" className="w-full">
      <DataLabel label="building type">
        <b>{getBlockTypeName(buildingType)}</b>
      </DataLabel>
      <div className="grid grid-cols-3 w-full">
        <DataLabel label="level">
          <b>{level}</b>
        </DataLabel>
        <DataLabel label="max level">
          <b>{maxLevel}</b>
        </DataLabel>
        <DataLabel label="coord">
          <b>
            [{position.x}, {position.y}]
          </b>
        </DataLabel>
      </div>
      {production && (
        <div className="grid grid-cols-2 w-full mb-1">
          <DataLabel label="PRODUCTION">
            <Badge className="text-xs gap-2">
              <ResourceIconTooltip
                name={getBlockTypeName(production.resourceID)}
                image={ResourceImage.get(production.resourceID) ?? ""}
                resource={production.resourceID}
                amount={production.resourceProductionRate}
                resourceType={ResourceCategory.ResourceRate}
              />
            </Badge>
          </DataLabel>
          <DataLabel label="next level production">
            {!upgrade.production || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              <Badge className="text-xs gap-2">
                <ResourceIconTooltip
                  name={getBlockTypeName(upgrade.production.resourceID)}
                  image={ResourceImage.get(upgrade.production.resourceID) ?? ""}
                  resource={upgrade.production.resourceID}
                  amount={upgrade.production.resourceProductionRate}
                  resourceType={ResourceCategory.ResourceRate}
                />
              </Badge>
            )}
          </DataLabel>
        </div>
      )}
      {unitProductionMultiplier && (
        <div className="grid grid-cols-2 w-full ">
          <DataLabel label="speed">
            <b>x{unitProductionMultiplier * RESOURCE_SCALE}</b>{" "}
          </DataLabel>
          <DataLabel label="next level speed">
            {!upgrade.nextLevelUnitProductionMultiplier || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              <b>x{upgrade.nextLevelUnitProductionMultiplier * RESOURCE_SCALE}</b>
            )}
          </DataLabel>
        </div>
      )}
      {storages && storages.length !== 0 && (
        <div className="grid grid-cols-1 w-full mb-1">
          <DataLabel label="storage">
            {storages.map((storage) => {
              return (
                <Badge key={storage.resourceId} className="text-xs gap-2">
                  <ResourceIconTooltip
                    name={getBlockTypeName(storage.resourceId)}
                    image={ResourceImage.get(storage.resourceId) ?? ""}
                    resource={storage.resourceId}
                    amount={storage.amount}
                    resourceType={storage.resourceType}
                    scale={storage.resourceType === ResourceCategory.Utility ? 1 : RESOURCE_SCALE}
                    direction="top"
                  />
                </Badge>
              );
            })}
          </DataLabel>
          <DataLabel label="next level storage">
            {!upgrade.storages || upgrade.storages.length === 0 || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              upgrade.storages.map((storage) => {
                return (
                  <Badge key={storage.resourceId} className="text-xs gap-2">
                    <ResourceIconTooltip
                      name={getBlockTypeName(storage.resourceId)}
                      image={ResourceImage.get(storage.resourceId) ?? ""}
                      resource={storage.resourceId}
                      amount={storage.amount}
                      resourceType={storage.resourceType}
                      scale={storage.resourceType === ResourceCategory.Utility ? 1 : RESOURCE_SCALE}
                      direction="top"
                    />
                  </Badge>
                );
              })
            )}
          </DataLabel>
        </div>
      )}

      <Navigator.BackButton />
    </Navigator.Screen>
  );
};
