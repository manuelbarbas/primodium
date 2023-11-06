import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { ResourceIconTooltip } from "src/components/shared/ResourceIconTooltip";
import { useBuildingInfo } from "src/hooks/useBuildingInfo";
import { useMud } from "src/hooks/useMud";
import { getBlockTypeName } from "src/util/common";
import { RESOURCE_SCALE, ResourceImage, ResourceType } from "src/util/constants";

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
  const {
    buildingType,
    level,
    maxLevel,
    position,
    production,
    upgrade,
    requiredDependencies,
    unitProductionMultiplier,
    storages,
  } = useBuildingInfo(building);

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
      {(production.length !== 0 || upgrade.production.length !== 0) && (
        <div className="grid grid-cols-2 w-full">
          <DataLabel label="PRODUCTION">
            {!upgrade.production.length ? (
              <b>N/A</b>
            ) : (
              production.map(({ resource, amount, type }) => (
                <Badge className="text-xs gap-2" key={`production-${resource}`}>
                  <ResourceIconTooltip
                    name={getBlockTypeName(resource)}
                    image={ResourceImage.get(resource) ?? ""}
                    resource={resource}
                    playerEntity={playerEntity}
                    amount={amount}
                    resourceType={type}
                    scale={type == ResourceType.ResourceRate ? RESOURCE_SCALE : 1n}
                    fractionDigits={3}
                  />
                </Badge>
              ))
            )}
          </DataLabel>
          <DataLabel label="next level production">
            {!upgrade.production.length || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              upgrade.production.map(({ resource, amount, type }) => (
                <Badge className="text-xs gap-2" key={`next-production-${resource}`}>
                  <ResourceIconTooltip
                    name={getBlockTypeName(resource)}
                    image={ResourceImage.get(resource) ?? ""}
                    resource={resource}
                    playerEntity={playerEntity}
                    amount={amount}
                    resourceType={type}
                    scale={type == ResourceType.ResourceRate ? RESOURCE_SCALE : 1n}
                    fractionDigits={3}
                  />
                </Badge>
              ))
            )}
          </DataLabel>
        </div>
      )}
      {(requiredDependencies.length !== 0 || upgrade.requiredDependencies.length !== 0) && (
        <div className="grid grid-cols-2 w-full ">
          <DataLabel label="resource usage">
            {!upgrade.production.length ? (
              <b>N/A</b>
            ) : (
              requiredDependencies.map(({ resource, amount, type }) => (
                <Badge className="text-xs gap-2" key={`production-${resource}`}>
                  <ResourceIconTooltip
                    name={getBlockTypeName(resource)}
                    image={ResourceImage.get(resource) ?? ""}
                    resource={resource}
                    playerEntity={playerEntity}
                    amount={amount}
                    resourceType={type}
                    scale={type == ResourceType.ResourceRate ? RESOURCE_SCALE : 1n}
                    fractionDigits={3}
                  />
                </Badge>
              ))
            )}
          </DataLabel>
          <DataLabel label="next level resource Usage">
            {!upgrade.production.length || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              upgrade.requiredDependencies.map(({ resource, amount, type }) => (
                <Badge className="text-xs gap-2" key={`next-production-${resource}`}>
                  <ResourceIconTooltip
                    fractionDigits={3}
                    name={getBlockTypeName(resource)}
                    image={ResourceImage.get(resource) ?? ""}
                    resource={resource}
                    playerEntity={playerEntity}
                    amount={amount}
                    resourceType={type}
                    scale={type == ResourceType.ResourceRate ? RESOURCE_SCALE : 1n}
                  />
                </Badge>
              ))
            )}
          </DataLabel>
        </div>
      )}
      {unitProductionMultiplier !== undefined && (
        <div className="grid grid-cols-2 w-full ">
          <DataLabel label="unit prod speed">
            <b>x{(unitProductionMultiplier / RESOURCE_SCALE).toString()}</b>
          </DataLabel>
          <DataLabel label="next level unit prod speed">
            {!upgrade.nextLevelUnitProductionMultiplier || level === maxLevel ? (
              <b>N/A</b>
            ) : (
              <b>x{(upgrade.nextLevelUnitProductionMultiplier / RESOURCE_SCALE).toString()}</b>
            )}
          </DataLabel>
        </div>
      )}
      {storages && storages.length !== 0 && (
        <div className="grid grid-cols-1 w-full">
          <DataLabel label="storage">
            {storages.map((storage) => {
              return (
                <Badge key={storage.resource} className="text-xs gap-2">
                  <ResourceIconTooltip
                    fractionDigits={3}
                    name={getBlockTypeName(storage.resource)}
                    playerEntity={playerEntity}
                    image={ResourceImage.get(storage.resource) ?? ""}
                    resource={storage.resource}
                    amount={storage.amount}
                    resourceType={storage.resourceType}
                    scale={RESOURCE_SCALE}
                    direction="top"
                    short
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
                      fractionDigits={3}
                      name={getBlockTypeName(storage.resource)}
                      playerEntity={playerEntity}
                      image={ResourceImage.get(storage.resource) ?? ""}
                      resource={storage.resource}
                      amount={storage.amount}
                      resourceType={storage.resourceType}
                      scale={RESOURCE_SCALE}
                      direction="top"
                      short
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
