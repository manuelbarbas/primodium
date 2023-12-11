import { Entity } from "@latticexyz/recs";
import { FaCircle, FaInfoCircle } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Tooltip } from "src/components/core/Tooltip";
import { BuildingImage } from "src/components/shared/BuildingImage";
import { useBuildingName } from "src/hooks/useBuildingName";
import { components } from "src/network/components";

export const Header: React.FC<{ building: Entity }> = ({ building }) => {
  const buildingName = useBuildingName(building);

  const active = components.IsActive.use(building)?.value;
  return (
    <SecondaryCard className="w-full">
      <div className="flex items-center gap-4">
        <BuildingImage building={building} />
        <div className="flex flex-col">
          <Tooltip direction="top" text={active ? "active" : "inactive"}>
            <Badge className="text-md py-4 rounded-box font-bold mb-2 flex gap-2">
              {buildingName}
              <FaCircle className={`text-${active ? "success" : "error"}`} />
            </Badge>
          </Tooltip>

          <Navigator.NavButton to="BuildingInfo" className="btn-xs btn-ghost flex gap-2 w-fit opacity-75">
            <FaInfoCircle /> view more info
          </Navigator.NavButton>
        </div>
      </div>
    </SecondaryCard>
  );
};
