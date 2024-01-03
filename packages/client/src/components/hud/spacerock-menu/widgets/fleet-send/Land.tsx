import { AudioKeys } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { ERock, ESendType, EUnit } from "contracts/config/enums";
import { useMemo } from "react";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { invade } from "src/network/setup/contractCalls/invade";
import { raid } from "src/network/setup/contractCalls/raid";
import { TransactionQueueType, UnitEntityLookup } from "src/util/constants";
import { hashEntities } from "src/util/encode";
import { Hex } from "viem";

export const Land: React.FC<{
  destination: Entity;
  rockType: ERock;
}> = ({ destination, rockType }) => {
  const network = useMud().network;
  const playerEntity = network.playerEntity;
  const destinationOwner = components.OwnedBy.use(destination)?.value;
  const orbiting = components.Arrival.use({
    from: playerEntity,
    onlyOrbiting: true,
    destination: destination,
  }).filter((elem) => elem?.sendType !== ESendType.Reinforce);

  const attack = useMemo(
    () =>
      orbiting.reduce((acc, arrival) => {
        if (!arrival) return acc;
        const arrivalAttack = arrival.unitCounts.reduce((acc2, count, i) => {
          if (count == 0n) return acc2;
          const unit = UnitEntityLookup[(i + 1) as EUnit];
          const level =
            components.UnitLevel.getWithKeys({ entity: playerEntity as Hex, unit: unit as Hex })?.value ?? 0n;
          return acc2 + (components.P_Unit.getWithKeys({ entity: unit as Hex, level })?.attack ?? 0n) * count;
        }, 0n);
        return acc + arrivalAttack;
      }, 0n),
    [orbiting, playerEntity]
  );

  const isNeutral = destinationOwner === playerEntity || !destinationOwner;

  if (!orbiting.length) return <></>;

  const key = hashEntities(TransactionQueueType.Land, destination);
  return (
    <div className="w-full flex justify-center mt-2">
      <TransactionQueueMask queueItemId={key}>
        <Button
          className={`gap-2 w-44 ${isNeutral ? "btn-secondary" : "btn-error"} flex flex-col items-center `}
          clickSound={AudioKeys.Sequence7}
          onClick={() => {
            if (ERock.Motherlode === rockType) {
              invade(destination, network, key);
              return;
            }

            if (ERock.Asteroid === rockType) {
              raid(destination, network, key);
              return;
            }
          }}
        >
          <div className="flex flex-col p-1">
            <p className="text-lg">
              {isNeutral && "LAND"}
              {!isNeutral && "ATTACK"}
            </p>
            {attack > 0n && <p className="font-normal text-xs">{attack.toLocaleString()} ATK</p>}
          </div>
        </Button>
      </TransactionQueueMask>
    </div>
  );
};
