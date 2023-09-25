import { SecondaryCard } from "src/components/core/Card";
import { Badge } from "src/components/core/Badge";
import { Navigator } from "src/components/core/Navigator";
import { FaInfoCircle } from "react-icons/fa";

export const Header: React.FC<{ name: string; imageUri: string }> = ({
  name,
  imageUri,
}) => {
  return (
    <SecondaryCard className="w-full">
      <div className="flex items-center gap-4">
        {/* <BuildingImage building={building} /> */}

        <img
          src={imageUri}
          className={`pixel-images rounded-box bg-gray-900 p-2 border border-secondary`}
        />

        <div className="flex flex-col">
          <Badge className=" text-md py-4 rounded-box font-bold mb-2">
            {name}
          </Badge>
          <Navigator.NavButton
            to="SpaceRockInfo"
            className="btn-xs btn-ghost flex gap-2 w-fit opacity-75"
          >
            <FaInfoCircle /> view more info
          </Navigator.NavButton>
        </div>
      </div>
    </SecondaryCard>
  );
};
