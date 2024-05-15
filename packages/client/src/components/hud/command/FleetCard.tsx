import { Tooltip } from "@/components/core/Tooltip";
import { useMud } from "@/hooks";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { Card, SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { useInCooldownEnd } from "src/hooks/useCooldownEnd";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { formatNumber, formatResourceCount, formatTime, formatTimeShort } from "src/util/number";
import { getFleetStats } from "src/util/unit";

type FleetCardProps = {
  stance?: string;
  destination?: Entity;
  home?: Entity;
  stats: ReturnType<typeof getFleetStats>;
  cooldown?: bigint;
  grace?: bigint;
  hostile?: boolean;
};

const filter =
  "invert(17%) sepia(70%) saturate(605%) hue-rotate(260deg) brightness(101%) contrast(111%) drop-shadow(1px 0px 0px #FF3232) drop-shadow(-1px  0px 0px #FF3232) drop-shadow( 0px  1px 0px #FF3232) drop-shadow( 0px -1px 0px #FF3232)";
export const _FleetCard: React.FC<FleetCardProps> = (props) => {
  const { hostile, stats, destination, grace, cooldown, home: ownerAsteroid, stance: fleetStateText } = props;

  const ownerPlayer = components.OwnedBy.use(ownerAsteroid)?.value as Entity | undefined;

  return (
    <SecondaryCard className="w-full gap-1">
      <div className="flex justify-between">
        <div className="text-sm font-bold uppercase flex flex-col">
          <p>
            {stats.title}
            {hostile && <span className="bg-error ml-1 text-[0.6rem] uppercase px-1">hostile</span>}
          </p>
          {ownerAsteroid && (
            <Tooltip content={`Controlled by ${ownerPlayer}`}>
              <p className="text-xs">
                <span className="opacity-80">Home:</span>{" "}
                <span className="text-secondary">{entityToRockName(ownerAsteroid as Entity)}</span>{" "}
              </p>
            </Tooltip>
          )}
        </div>
        {destination && (
          <div className="flex flex-col items-end">
            <p>{fleetStateText}</p> <p className="text-secondary -mt-1">{entityToRockName(destination as Entity)} </p>
          </div>
        )}
      </div>
      <div className="flex flex-col text-xs"></div>
      <div className="grid grid-cols-2">
        <div className="flex flex-col gap-2 justify-center items-center">
          <img src={InterfaceIcons.Fleet} className="h-3/4" style={hostile ? { filter } : {}} />
          {!!grace && (
            <div className="flex gap-2 text-xs items-center">
              <IconLabel imageUri={InterfaceIcons.Grace} className={`pixel-images w-3 h-3`} />
              Protected ({formatTimeShort(grace)})
            </div>
          )}
          {!!cooldown && (
            <div className="flex text-error font-bold  gap-1 text-xs p-1 h-4 items-center">
              In cooldown for {formatTimeShort(cooldown)}
            </div>
          )}
        </div>
        <div className="grid grid-rows-5 grid-cols-2 pl-6 text-xs">
          <p className="text-accent">ATTACK</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, stats.attack, { short: true })}</p>
          <p className="text-accent">COUNTER</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, stats.defense, { short: true })}</p>
          <p className="text-accent">HEALTH</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, stats.hp, { short: true })}</p>
          <p className="text-accent">CARGO</p>
          <p className="text-end">{formatResourceCount(EntityType.Iron, stats.cargo, { short: true })}</p>
          <p className="text-accent">SPEED</p>
          <p className="text-end">{formatNumber(stats.speed)}</p>
          <p className="text-accent">DECRYPTON</p>
          <p className="text-end">{formatResourceCount(EntityType.Iron, stats.decryption, { short: true })}</p>
        </div>
      </div>
    </SecondaryCard>
  );
};
export const FleetCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading } = useSyncStatus(entity);
  const fleetStats = getFleetStats(entity);
  const movement = components.FleetMovement.use(entity);
  const time = components.Time.use()?.value ?? 0n;
  const stance = components.FleetStance.use(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity);
  const { inCooldown, duration: coolDownDuration } = useInCooldownEnd(entity);
  const ownerAsteroid = components.OwnedBy.use(entity)?.value as Entity | undefined;

  const playerEntity = useMud().playerAccount.entity;
  const ownerPlayer = components.OwnedBy.use(ownerAsteroid)?.value as Entity | undefined;
  const fleetStateText = useMemo(() => {
    const arrivalTime = movement?.arrivalTime ?? 0n;
    const inTransit = arrivalTime > (time ?? 0n);
    if (inTransit) return `ETA ${formatTime(arrivalTime - time)}`;
    if (stance && stance?.stance === EFleetStance.Follow)
      return `Following ${entityToFleetName(stance.target as Entity)}`;
    if (stance?.stance === EFleetStance.Block) return "Blocking";
    if (stance?.stance === EFleetStance.Defend) return "Defending";
    return "Orbiting";
  }, [movement?.arrivalTime, time, stance]);

  if (loading)
    return (
      <Card className="relative flex items-center justify-center w-56 h-24 px-auto uppercase font-bold">
        <Loader />
        Loading Data
      </Card>
    );

  return (
    <_FleetCard
      stance={fleetStateText}
      destination={movement?.destination as Entity | undefined}
      home={ownerAsteroid}
      stats={fleetStats}
      cooldown={inCooldown ? coolDownDuration : undefined}
      grace={inGracePeriod ? duration : undefined}
      hostile={playerEntity !== ownerPlayer}
    />
  );
};
