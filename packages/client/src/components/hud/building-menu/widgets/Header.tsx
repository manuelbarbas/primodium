import { Entity } from "@latticexyz/recs";
import { FaInfoCircle } from "react-icons/fa";
import { Badge } from "src/components/core/Badge";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { BuildingImage } from "src/components/shared/BuildingImage";
import { useBuildingName } from "src/hooks/useBuildingName";

export const Header: React.FC<{ building: Entity }> = ({ building }) => {
  const buildingName = useBuildingName(building);

  return (
    <SecondaryCard className="w-full">
      <div className="flex items-center gap-4">
        <BuildingImage building={building} />
        <div className="flex flex-col">
          <Badge className=" text-md py-4 rounded-box font-bold mb-2">{buildingName}</Badge>
          <Navigator.NavButton to="BuildingInfo" className="btn-xs btn-ghost flex gap-2 w-fit opacity-75">
            <FaInfoCircle /> view more info
          </Navigator.NavButton>
        </div>
      </div>
    </SecondaryCard>
  );
};
