import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { Hangar, Send } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";

export const Invade: React.FC = () => {
  const origin = Send.getOrigin()?.entity;
  const units = Hangar.use(origin, {
    units: [],
    counts: [],
  }).units;

  return (
    <SecondaryCard
      className={`w-full flex-row items-center gap-2 justify-between ${
        units.length === 0 ? "opacity-20" : "0"
      }`}
    >
      <img src="/img/icons/attackicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">invade motherlode.</p>
      <Navigator.NavButton
        to="Send"
        className="btn-sm w-fit btn-error"
        disabled={units.length === 0}
        onClick={() => Send.update({ sendType: ESendType.INVADE })}
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
