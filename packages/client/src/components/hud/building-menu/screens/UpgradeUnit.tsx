import { FaInfoCircle } from "react-icons/fa";
import { EntityType } from "src/util/constants";
import { ResearchItem } from "../widgets/ResearchItem";

export const UpgradeUnit: React.FC = () => {
  return (
    <div>
      <p className="opacity-50 text-xs italic mb-4 flex gap-2 z-10">
        <FaInfoCircle size={16} /> All fleets owned by this asteroid will have their units upgraded.
      </p>
      <div className="grid grid-cols-2 w-full gap-1">
        <ResearchItem type={EntityType.AnvilDrone} />
        <ResearchItem type={EntityType.HammerDrone} />
        <ResearchItem type={EntityType.StingerDrone} />
        <ResearchItem type={EntityType.AegisDrone} />
        <ResearchItem type={EntityType.MinutemanMarine} />
        <ResearchItem type={EntityType.TridentMarine} />
      </div>
    </div>
  );
};
