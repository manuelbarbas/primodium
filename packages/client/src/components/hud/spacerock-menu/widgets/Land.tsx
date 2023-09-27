import { SingletonID } from "@latticexyz/network";
import { EntityID } from "@latticexyz/recs";
import { Button } from "src/components/core/Button";
import { useMud } from "src/hooks";
import { Arrival, OwnedBy } from "src/network/components/chainComponents";
import { Account } from "src/network/components/clientComponents";
import { useGameStore } from "src/store/GameStore";

import { invade, raid } from "src/util/web3";
import { ESendType, ESpaceRockType } from "src/util/web3/types";

export const Land: React.FC<{
  destination: EntityID;
  rockType: ESpaceRockType;
}> = ({ destination, rockType }) => {
  const network = useMud();
  const player = Account.use(undefined, {
    value: SingletonID,
  }).value;
  const destinationOwner = OwnedBy.use(destination)?.value;
  const transactionLoading = useGameStore((state) => state.transactionLoading);
  const orbitingInvade =
    Arrival.get({
      from: player,
      onlyOrbiting: true,
      destination: destination,
      sendType: ESendType.INVADE,
    }) ?? [];

  const orbitingRaid =
    Arrival.get({
      from: player,
      onlyOrbiting: true,
      destination: destination,
      sendType: ESendType.RAID,
    }) ?? [];

  const isNeutral = destinationOwner === player || !destinationOwner;

  if (!orbitingInvade.length && !orbitingRaid.length) return <></>;

  return (
    <div className="w-full flex justify-center mt-2">
      <Button
        disabled={transactionLoading}
        loading={transactionLoading}
        className={`btn-sm w-44 ${
          isNeutral ? "btn-secondary" : "btn-error"
        } flex items-center `}
        onClick={() => {
          if (ESpaceRockType.Motherlode === rockType) {
            invade(destination, network);
            return;
          }

          if (ESpaceRockType.Asteroid === rockType) {
            raid(destination, network);
            return;
          }
        }}
      >
        {isNeutral && "LAND"}
        {!isNeutral && "ATTACK"}
      </Button>
    </div>
  );
};
