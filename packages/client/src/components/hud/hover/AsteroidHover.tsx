import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { formatResourceCount, formatTime } from "src/util/number";
import { getMoveLength } from "src/util/send";
import { getCanSend, getFleetUnitCounts } from "src/util/unit";
import { Card } from "../../core/Card";
import { GracePeriod } from "../GracePeriod";
import { HealthBar } from "../HealthBar";

export const AsteroidHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const name = entityToRockName(entity);
  const { inGracePeriod } = useInGracePeriod(entity);
  const { resourceCount: encryption } = useFullResourceCount(EntityType.Encryption, entity);
  const isPirate = components.PirateAsteroid.has(entity);
  const ownedBy = components.OwnedBy.use(entity)?.value;

  return (
    <Card className="ml-5 uppercase font-bold text-xs relative text-center flex flex-col justify-center gap-1 items-center">
      <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50 " />
      <AsteroidEta entity={entity} />
      <div className="z-10">
        <p className="inline">{name}</p>{" "}
      </div>
      {inGracePeriod && (
        <Badge className="text-xs text-accent bg-slate-900 p-2 w-24">
          <GracePeriod entity={entity} />
        </Badge>
      )}
      {!inGracePeriod && ownedBy && !isPirate && (
        <Badge className="text-xs text-accent bg-slate-900 p-1 w-14">
          <HealthBar health={Number(formatResourceCount(EntityType.Encryption, encryption, { notLocale: true }))} />
        </Badge>
      )}
    </Card>
  );
};

const AsteroidEta = ({ entity }: { entity: Entity }) => {
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

  return <div className="opacity-70 bg-primary px-1 w-fit">ETA {formatTime(moveLength)}</div>;
};
