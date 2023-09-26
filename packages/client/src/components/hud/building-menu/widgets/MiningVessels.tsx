import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";

export const MiningVessels: React.FC = () => {
  return (
    <SecondaryCard className="w-full flex-row items-center gap-2">
      <img src="/img/unit/miningvessel.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">manage mining vessels</p>
      <Navigator.NavButton
        to="MiningVessels"
        className="btn-sm w-fit btn-secondary"
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
