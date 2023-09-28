import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

export const BuildUnit: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2 justify-between">
      <div className="flex gap-2 items-center">
        <img src="/img/unit/aegisdrone.png" className="w-8 h-8" />
        <p className="uppercase text-xs font-bold">build unit</p>
      </div>

      <Navigator.NavButton
        to="BuildQueue"
        className="btn-sm w-fit btn-secondary"
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
