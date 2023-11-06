import { ESendType } from "contracts/config/enums";
import { FaArrowRight } from "react-icons/fa";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { useFleetMoves } from "src/hooks/useFleetMoves";
import { components } from "src/network/components";

export const Reinforce = () => {
  const origin = components.Send.get()?.origin;
  const destination = components.Send.get()?.destination;
  const units = components.Hangar.use(origin, {
    units: [],
    counts: [],
  }).units;
  const playerEntity = components.Account.use()?.value;
  const ownedBy = components.OwnedBy.use(destination)?.value;
  const fleetMoves = useFleetMoves();

  return (
    <SecondaryCard
      className={`w-full flex-row items-center gap-2 justify-between ${
        units.length === 0 || ownedBy !== playerEntity || origin === destination || !fleetMoves ? "opacity-20" : "0"
      }`}
    >
      <img src="/img/icons/reinforcementicon.png" className="w-8 h-8" />
      <p className="uppercase text-xs font-bold">reinforce</p>
      <Navigator.NavButton
        to="Send"
        className="btn-sm w-fit btn-success"
        disabled={units.length === 0 || ownedBy !== playerEntity || origin === destination || !fleetMoves}
        onClick={() => components.Send.update({ sendType: ESendType.Reinforce })}
      >
        <FaArrowRight />
      </Navigator.NavButton>
    </SecondaryCard>
  );
};
