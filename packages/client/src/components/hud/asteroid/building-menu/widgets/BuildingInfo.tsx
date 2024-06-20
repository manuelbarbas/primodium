import { FaInfoCircle } from "react-icons/fa";
import { SecondaryCard } from "@/components/core/Card";
import { Navigator } from "@/components/core/Navigator";

export const BuildingInfo: React.FC = () => {
  return (
    <SecondaryCard className="w-full">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <Navigator.NavButton to="BuildingInfo" variant="ghost" className="flex gap-2 w-fit opacity-75">
            <FaInfoCircle /> view more info
          </Navigator.NavButton>
        </div>
      </div>
    </SecondaryCard>
  );
};
