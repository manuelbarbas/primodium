import { ESendType } from "contracts/config/enums";
import { useMemo } from "react";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { AttackingFleet } from "./AttackingFleet";

export const OrbitingFleets: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;
  const fleets = components.Arrival.useAllWith({
    to: playerEntity,
  });
  const now = components.Time.use()?.value ?? 0n;

  const attackingOrbitingFleets = useMemo(
    () =>
      fleets.map((entity) => {
        const fleet = components.Arrival.getEntity(entity);

        if (!fleet) return null;

        // remove reinforcement arrivals
        if (fleet.sendType === ESendType.Reinforce) return null;

        //remove incoming arrivals
        if (fleet.arrivalTime >= now) return null;

        return fleet;
      }),
    [now, fleets]
  );

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto scrollbar">
      {attackingOrbitingFleets.length === 0 && (
        <div className="w-full h-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center font-bold">
          <p className="opacity-50">NO HOSTILE ORBITING FLEETS</p>
        </div>
      )}
      {attackingOrbitingFleets.length !== 0 &&
        attackingOrbitingFleets.map((fleet, index) => {
          if (!fleet) return;
          return <AttackingFleet key={index} fleet={fleet} />;
        })}
    </div>
  );
};
