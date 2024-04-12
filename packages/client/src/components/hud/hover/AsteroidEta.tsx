import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { formatTime } from "src/util/number";
import { getMoveLength } from "src/util/send";
import { getCanSend, getFleetUnitCounts } from "src/util/unit";

export const AsteroidEta = ({ entity }: { entity: Entity }) => {
  const playerEntity = components.Account.use()?.value;
  const originFleet = components.Send.use()?.originFleet;
  const originFleetRock = components.FleetMovement.use(originFleet)?.destination as Entity;
  const originPosition = components.Position.use(originFleetRock);
  const destinationPosition = components.Position.use(entity);
  const moveLength =
    originPosition && destinationPosition && originFleet && playerEntity
      ? getMoveLength(
          originPosition,
          destinationPosition,
          playerEntity,
          Object.fromEntries(getFleetUnitCounts(originFleet))
        )
      : 0;
  const isTarget = moveLength > 0 && originFleet && getCanSend(originFleet, entity);
  if (!isTarget) return <></>;

  return (
    <div className="flex font-bold items-center justify-center uppercase text-xs pulse bg-base-100 border border-primary px-1 w-fit">
      ETA {formatTime(moveLength)}
    </div>
  );
};
