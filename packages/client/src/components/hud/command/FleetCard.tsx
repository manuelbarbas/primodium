import { Tooltip } from "@/components/core/Tooltip";
import { Entity } from "@primodiumxyz/reactive-tables";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { Card, SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { useAccountClient, useCore, useInCooldown, useInGracePeriod, useSyncStatus } from "@primodiumxyz/core/react";
import {
  entityToFleetName,
  entityToRockName,
  EntityType,
  formatNumber,
  formatResourceCount,
  formatTime,
  formatTimeShort,
} from "@primodiumxyz/core";

type FleetCardProps = {
  stance?: string;
  destination?: Entity;
  home?: Entity;
  stats: {
    title: string;
    attack: bigint;
    defense: bigint;
    hp: bigint;
    cargo: bigint;
    speed: bigint;
    decryption: bigint;
  };
  cooldown?: bigint;
  grace?: bigint;
  hostile?: boolean;
};

export const _FleetCard: React.FC<FleetCardProps> = (props) => {
  const { tables } = useCore();
  const { hostile, stats, destination, grace, cooldown, home: ownerAsteroid, stance: fleetStateText } = props;

  const ownerPlayer = tables.OwnedBy.use(ownerAsteroid)?.value as Entity | undefined;

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
          <img src={hostile ? InterfaceIcons.EnemyFleet : InterfaceIcons.Fleet} className="h-3/4" />
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
          <p className="text-accent">DECRYPTION</p>
          <p className="text-end">{formatResourceCount(EntityType.Iron, stats.decryption, { short: true })}</p>
        </div>
      </div>
    </SecondaryCard>
  );
};
export const FleetCard: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { tables, utils } = useCore();
  const { loading } = useSyncStatus(entity);
  const fleetStats = utils.getFleetStats(entity);
  const movement = tables.FleetMovement.use(entity);
  const time = tables.Time.use()?.value ?? 0n;
  const stance = tables.FleetStance.use(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity);
  const { inCooldown, duration: coolDownDuration } = useInCooldown(entity);
  const ownerAsteroid = tables.OwnedBy.use(entity)?.value as Entity | undefined;

  const playerEntity = useAccountClient().playerAccount.entity;
  const ownerPlayer = tables.OwnedBy.use(ownerAsteroid)?.value as Entity | undefined;
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
