import { EntityID } from "@latticexyz/recs";
import { Arrival } from "src/network/components/chainComponents";
import { ESendType } from "src/util/web3/types";
import { Fleet } from "./Fleet";

export const Reinforcementfleets: React.FC<{ user: EntityID }> = ({ user }) => {
  const fleets = Arrival.use({
    to: user,
    sendType: ESendType.REINFORCE,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <div className="w-full bg-slate-800 border rounded-md border-slate-700 flex items-center justify-center h-12 font-bold">
          <p className="opacity-50">NO REINFORCEMENT FLEETS</p>
        </div>
      ) : (
        fleets.map((fleet, i) => {
          if (!fleet) return null;
          return (
            <Fleet
              key={i}
              arrivalEntity={fleet.entity}
              arrivalBlock={fleet.arrivalBlock}
              destination={fleet.destination}
              sendType={fleet.sendType}
              outgoing={false}
            />
          );
        })
      )}
    </div>
  );
};
