import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { OwnedBy } from "src/network/components/chainComponents";
import { Hangar, Send } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";

export const Reinforce = () => {
  const origin = Send.getOrigin()?.entity;
  const destination = Send.getDestination()?.entity;
  const units = Hangar.use(origin, {
    units: [],
    counts: [],
  }).units;
  const ownedBy = OwnedBy.get(destination)?.value;
  const fleetMoves = useFleetMoves();

  return (
    <SecondaryCard
      className={`w-full flex-row items-center gap-2 justify-between ${
        units.length === 0 || !ownedBy || origin === destination || !fleetMoves
          ? "opacity-20"
          : "0"
      }`}
    >
      <img src="/img/icons/reinforcementicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">reinforce</p>
      <Navigator.NavButton
        to="Send"
        className="btn-sm w-fit btn-success"
        disabled={
          units.length === 0 ||
          !ownedBy ||
          origin === destination ||
          !fleetMoves
        }
        onClick={() => Send.update({ sendType: ESendType.REINFORCE })}
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
