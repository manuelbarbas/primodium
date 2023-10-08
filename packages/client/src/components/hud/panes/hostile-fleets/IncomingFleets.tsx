import { SingletonID } from "@latticexyz/network";
import { EntityID } from "@latticexyz/recs";
import { useMemo } from "react";
import { Arrival, OwnedBy } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { ESendType } from "src/util/web3/types";
import { AttackingFleet } from "./AttackingFleet";

export const IncomingFleets: React.FC<{ spaceRock: EntityID }> = ({ spaceRock }) => {
  const player = Account.use()?.value ?? SingletonID;

  const orbitingFleets = Arrival.use({
    to: player,
    onlyTransit: true,
  });

  //filter collection where sendType is not REINFORCE
  const attackingIncomingFleets = useMemo(
    () =>
      orbitingFleets.filter((fleet) => {
        if (!fleet) return false;

        if (OwnedBy.get(fleet.destination)?.value !== player) return false;

        return fleet.sendType !== ESendType.REINFORCE;
      }),
    [orbitingFleets]
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
          return <AttackingFleet key={index} fleet={fleet} spaceRock={spaceRock} />;
        })}
    </div>
  );
};
