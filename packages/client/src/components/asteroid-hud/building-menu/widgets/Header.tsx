import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { SecondaryCard } from "src/components/core/Card";
import { Badge } from "src/components/core/Badge";
import { BuildingImage } from "src/components/shared/BuildingImage";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { getBuildingInfo } from "src/util/building";
import { getBlockTypeName } from "src/util/common";
import {
  ResourceImage,
  ResourceType,
  RESOURCE_SCALE,
} from "src/util/constants";

export const Header: React.FC<{ building: EntityID }> = ({ building }) => {
  const buildingInfo = useMemo(() => {
    return getBuildingInfo(building);
  }, [building]);

  if (!buildingInfo) return null;

  const { buildingName, production, storages } = buildingInfo;

  return (
    <SecondaryCard>
      <div className="flex items-center gap-4">
        <BuildingImage building={building} />
        <div>
          <Badge className=" text-md py-4 rounded-box font-bold mb-2">
            {buildingName}
          </Badge>
          {production && (
            <div className="text-xs gap-2 px-2">
              <p className="text-xs opacity-75 mb-1">PRODUCES</p>
              <Badge className="text-xs gap-2">
                <ResourceIconTooltip
                  name={getBlockTypeName(production.resourceID)}
                  image={ResourceImage.get(production.resourceID) ?? ""}
                  resourceId={production.resourceID}
                  amount={production.resourceProductionRate}
                  resourceType={ResourceType.ResourceRate}
                />
              </Badge>
            </div>
          )}
          {storages.length !== 0 && (
            <p className="text-xs opacity-75 px-2 mb-1">PROVIDES</p>
          )}
          <div className="flex flex-wrap gap-1 px-2 min-w-80! w-80">
            {storages &&
              storages.length !== 0 &&
              storages.map((storage) => {
                return (
                  <Badge key={storage.resourceId} className="text-xs gap-2">
                    <ResourceIconTooltip
                      name={getBlockTypeName(storage.resourceId)}
                      image={ResourceImage.get(storage.resourceId) ?? ""}
                      resourceId={storage.resourceId}
                      amount={storage.amount}
                      resourceType={storage.resourceType}
                      scale={
                        storage.resourceType === ResourceType.Utility
                          ? 1
                          : RESOURCE_SCALE
                      }
                      direction="top"
                    />
                  </Badge>
                );
              })}
          </div>
        </div>
      </div>
    </SecondaryCard>
  );
};
