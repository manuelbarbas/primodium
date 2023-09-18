import { EntityID } from "@latticexyz/recs";
import { SecondaryCard } from "src/components/core/Card";
import { Badge } from "src/components/core/Badge";
import { BuildingImage } from "src/components/shared/BuildingImage";
import ResourceIconTooltip from "src/components/shared/ResourceIconTooltip";
import { getBlockTypeName } from "src/util/common";
import {
  ResourceImage,
  ResourceType,
  RESOURCE_SCALE,
} from "src/util/constants";
import { useBuildingInfo } from "src/hooks/useBuildingInfo";

export const Header: React.FC<{ building: EntityID }> = ({ building }) => {
  const { buildingName, production, storages } = useBuildingInfo(building);

  return (
    <SecondaryCard className="w-full">
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
          <div className="flex flex-wrap gap-1 px-2">
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
