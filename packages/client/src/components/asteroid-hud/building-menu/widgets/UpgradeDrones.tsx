import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

export const UpgradeDrones: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <img src="/img/icons/powercoreicon.png" className="w-8 h-8" />
        <p className="uppercase text-xs font-bold">upgrade drones</p>
      </div>

      <Navigator.NavButton
        to="BuildDrones"
        className="btn-sm w-fit btn-secondary"
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
