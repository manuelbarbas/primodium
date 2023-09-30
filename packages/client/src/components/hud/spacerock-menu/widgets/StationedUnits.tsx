import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Hangar, Send } from "src/network/components/clientComponents";

export const StationedUnits: React.FC = () => {
  const destination = Send.get()?.destination;
  const units = Hangar.use(destination, {
    units: [],
    counts: [],
  }).units;

  return (
    <SecondaryCard
      className={`w-full flex-row items-center gap-2 justify-between ${
        units.length === 0 ? "opacity-20" : "0"
      }`}
    >
      <img src="/img/icons/mainbaseicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">manage stationed units</p>
      <Navigator.NavButton
        to="StationedUnits"
        className="btn-sm w-fit btn-secondary"
        disabled={units.length === 0}
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
