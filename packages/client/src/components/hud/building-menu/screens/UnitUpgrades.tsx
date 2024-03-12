import { FaInfoCircle } from "react-icons/fa";
import { EntityType } from "src/util/constants";
import { UnitUpgrade } from "../widgets/UnitUpgrade";

export const UnitUpgrades: React.FC = () => {
  return (
    <div>
      <p className="opacity-50 text-xs italic mb-4 flex gap-2 z-10">
        <FaInfoCircle size={16} /> All fleets owned by this asteroid will have their units upgraded.
      </p>
      <div className="grid grid-cols-4 w-full gap-1">
        <UnitUpgrade unit={EntityType.LightningCraft} />
        <UnitUpgrade unit={EntityType.AnvilDrone} />
        <UnitUpgrade unit={EntityType.HammerDrone} />
        <UnitUpgrade unit={EntityType.StingerDrone} />
        <UnitUpgrade unit={EntityType.AegisDrone} />
        <UnitUpgrade unit={EntityType.MinutemanMarine} />
        <UnitUpgrade unit={EntityType.TridentMarine} />
      </div>
    </div>
  );
};
