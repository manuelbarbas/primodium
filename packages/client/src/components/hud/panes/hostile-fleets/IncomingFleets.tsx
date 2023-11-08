import { ESendType } from "contracts/config/enums";
import { useMemo } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { useNow } from "src/util/time";
import { AttackingFleet } from "./AttackingFleet";

export const IncomingFleets: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;
  const fleets = components.Arrival.useAllWith({
    to: playerEntity,
  });
  const now = useNow();

  const attackingIncomingFleets = useMemo(
    () =>
      fleets.map((entity) => {
        const fleet = components.Arrival.getEntity(entity);

        if (!fleet) return null;

        // remove reinforcement arrivals
        if (fleet.sendType === ESendType.Reinforce) return null;

        //remove orbiting arrivals
        if (fleet.arrivalTime <= now) return null;

        return fleet;
      }),
    [now, fleets]
  );

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto scrollbar">
      {attackingIncomingFleets.length === 0 && (
        <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
          <p className="opacity-50">NO HOSTILE INCOMING FLEETS</p>
        </div>
      )}
      {attackingIncomingFleets.length !== 0 &&
        attackingIncomingFleets.map((fleet, index) => {
          if (!fleet) return;
          return <AttackingFleet key={index} fleet={fleet} />;
        })}
    </div>
  );
};
