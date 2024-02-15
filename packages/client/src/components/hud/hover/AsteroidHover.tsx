import { Entity } from "@latticexyz/recs";
import { Badge } from "src/components/core/Badge";
import { IconLabel } from "src/components/core/IconLabel";
import { useFullResourceCount } from "src/hooks/useFullResourceCount";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { formatResourceCount, formatTime, formatTimeShort } from "src/util/number";
import { getMoveLength } from "src/util/send";
import { getCanSend, getFleetUnitCounts } from "src/util/unit";
import { Card } from "../../core/Card";
import { HealthBar } from "../HealthBar";

export const AsteroidHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const name = entityToRockName(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity);
  const { resourceCount: encryption } = useFullResourceCount(EntityType.Encryption, entity);
  const isPirate = components.PirateAsteroid.has(entity);
  const ownedBy = components.OwnedBy.use(entity)?.value;

  return (
    <Card className="ml-5 w-56 relative">
      <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50 " />
      <div className="flex flex-col gap-1 z-10">
        <div className="flex gap-1 items-center">
          <IconLabel imageUri="/img/icons/asteroidicon.png" className={`pixel-images w-3 h-3 bg-base-100`} />
          <p className="text-sm font-bold uppercase">{name}</p>
        </div>

        <div className="flex gap-1">
          <AsteroidEta entity={entity} />
          {inGracePeriod && (
            <div className="flex bg-primary font-bold border border-secondary/50 gap-2 text-xs p-1 items-center">
              <IconLabel imageUri="/img/icons/graceicon.png" className={`pixel-images w-3 h-3`} />
              {formatTimeShort(duration)}
            </div>
          )}
        </div>

        {!inGracePeriod && ownedBy && !isPirate && (
          <Badge className="text-xs text-accent bg-slate-900 p-1">
            <HealthBar health={Number(formatResourceCount(EntityType.Encryption, encryption, { notLocale: true }))} />
          </Badge>
        )}
      </div>
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

  return (
    <div className="flex font-bold items-center justify-center uppercase text-xs pulse bg-primary px-1 w-fit">
      ETA {formatTime(moveLength)}
    </div>
  );
};
