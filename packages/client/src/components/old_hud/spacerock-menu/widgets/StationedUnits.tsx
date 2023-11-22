import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";

export const StationedUnits: React.FC = () => {
  const destination = components.Send.get()?.destination;
  const units = components.Hangar.use(destination, {
    units: [],
    counts: [],
  }).units;
  const player = components.Account.use()?.value;
  const owner = components.OwnedBy.get(destination)?.value;

  const disabled = units.length === 0 || player !== owner;

  return (
    <SecondaryCard className={`w-full flex-row items-center gap-2 justify-between ${disabled ? "opacity-20" : "0"}`}>
      <img src="/img/icons/mainbaseicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">manage stationed units</p>
      <Navigator.NavButton to="StationedUnits" className="btn-sm w-fit btn-secondary" disabled={disabled}>
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
