import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { useBuildingInfo } from "src/hooks/useBuildingInfo";
import { useMud } from "src/hooks/useMud";
import { getBlockTypeName } from "src/util/common";
import { ResourceImage, ResourceType, RESOURCE_SCALE, ResourceEntityLookup } from "src/util/constants";

const DataLabel: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  return (
    <SecondaryCard className="text-xs gap-2 w-full">
      <p className="text-xs opacity-75 mb-1 uppercase">{label}</p>
      <div className="flex flex-wrap gap-1">{children}</div>
    </SecondaryCard>
  );
};

export const BuildingInfo: React.FC<{ building: Entity }> = ({ building }) => {
  const playerEntity = useMud().network.playerEntity;
  const { buildingType, level, maxLevel, position, production, upgrade, unitProductionMultiplier, storages } =
    useBuildingInfo(building);

  return (
    <Navigator.Screen title="BuildingInfo" className="w-full">
      <DataLabel label="building type">
        <b>{getBlockTypeName(buildingType as Entity)}</b>
      </DataLabel>
      <div className="grid grid-cols-3 w-full">
        <DataLabel label="level">
          <b>{level.toString()}</b>
        </DataLabel>
        <DataLabel label="max level">
          <b>{maxLevel.toString()}</b>
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
                name={getBlockTypeName(ResourceEntityLookup[production.resource as EResource])}
                image={ResourceImage.get(ResourceEntityLookup[production.resource as EResource]) ?? ""}
                resource={ResourceEntityLookup[production.resource as EResource]}
                playerEntity={playerEntity}
                amount={production.amount}
                resourceType={ResourceType.ResourceRate}
              />
            </Badge>
          </DataLabel>
          <DataLabel label="next level production">
            {!upgrade.production || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              <Badge className="text-xs gap-2">
                <ResourceIconTooltip
                  name={getBlockTypeName(ResourceEntityLookup[upgrade.production.resource as EResource])}
                  image={ResourceImage.get(ResourceEntityLookup[upgrade.production.resource as EResource]) ?? ""}
                  resource={ResourceEntityLookup[upgrade.production.resource as EResource]}
                  playerEntity={playerEntity}
                  amount={upgrade.production.amount}
                  resourceType={ResourceType.ResourceRate}
                />
              </Badge>
            )}
          </DataLabel>
        </div>
      )}
      {unitProductionMultiplier !== undefined && (
        <div className="grid grid-cols-2 w-full ">
          <DataLabel label="speed">
            <b>x{(unitProductionMultiplier / RESOURCE_SCALE).toString()}</b>
          </DataLabel>
          <DataLabel label="next level speed">
            {!upgrade.nextLevelUnitProductionMultiplier || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              <b>x{(upgrade.nextLevelUnitProductionMultiplier / RESOURCE_SCALE).toString()}</b>
            )}
          </DataLabel>
        </div>
      )}
      {storages && storages.length !== 0 && (
        <div className="grid grid-cols-1 w-full mb-1">
          <DataLabel label="storage">
            {storages.map((storage) => {
              return (
                <Badge key={storage.resource} className="text-xs gap-2">
                  <ResourceIconTooltip
                    name={getBlockTypeName(storage.resource)}
                    playerEntity={playerEntity}
                    image={ResourceImage.get(storage.resource) ?? ""}
                    resource={storage.resource}
                    amount={storage.amount}
                    resourceType={storage.resourceType}
                    scale={storage.resourceType === ResourceType.Utility ? 1n : RESOURCE_SCALE}
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
                  <Badge key={storage.resource} className="text-xs gap-2">
                    <ResourceIconTooltip
                      name={getBlockTypeName(storage.resource)}
                      playerEntity={playerEntity}
                      image={ResourceImage.get(storage.resource) ?? ""}
                      resource={storage.resource}
                      amount={storage.amount}
                      resourceType={storage.resourceType}
                      scale={storage.resourceType === ResourceType.Utility ? 1n : RESOURCE_SCALE}
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
