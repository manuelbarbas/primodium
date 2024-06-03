import { SecondaryCard } from "@/components/core/Card";
import { useMud } from "@/hooks";
import { usePlayerOwner } from "@/hooks/usePlayerOwner";
import { EntityToResourceImage, EntityToUnitImage } from "@/util/mappings";
import { Entity } from "@latticexyz/recs";
import { InterfaceIcons } from "@primodiumxyz/assets";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { useInCooldownEnd } from "src/hooks/useCooldownEnd";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { EntityType, ResourceStorages } from "src/util/constants";
import { entityToFleetName, entityToRockName } from "src/util/name";
import { formatNumber, formatResourceCount, formatTime, formatTimeShort } from "src/util/number";
import { getFleetStats } from "src/util/unit";

export const FleetHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading } = useSyncStatus(entity);
  const fleetStats = getFleetStats(entity);
  const movement = components.FleetMovement.use(entity);
  const time = components.Time.use()?.value ?? 0n;
  const stance = components.FleetStance.use(entity);
  const homeAsteroid = components.OwnedBy.get(entity)?.value as Entity | undefined;
  const { inGracePeriod, duration } = useInGracePeriod(entity);
  const { inCooldown, duration: cooldownDuration } = useInCooldownEnd(entity);

  const playerEntity = useMud().playerAccount.entity;
  const friendly = usePlayerOwner(entity) === playerEntity;

  const FleetStateText = useMemo(() => {
    const arrivalTime = movement?.arrivalTime ?? 0n;
    const destination = movement?.destination ? entityToRockName(movement.destination as Entity) : "";
    const inTransit = arrivalTime > (time ?? 0n);
    if (inTransit) return () => <p className="text-xs">ETA {formatTime(arrivalTime - time)}</p>;
    if (stance && stance?.stance === EFleetStance.Follow)
      return () => (
        <p className="text-xs">
          Following <span className="text-accent">{entityToFleetName(stance.target as Entity)}</span>
        </p>
      );
    if (stance?.stance === EFleetStance.Block)
      return () => (
        <p className="text-xs">
          Blocking <span className="text-accent">{destination}</span>
        </p>
      );
    if (stance?.stance === EFleetStance.Defend)
      return () => (
        <p className="text-xs">
          Defending <span className="text-accent">{destination}</span>
        </p>
      );
    return () => (
      <p className="text-xs">
        Orbiting <span className="text-accent">{destination}</span>
      </p>
    );
  }, [movement?.arrivalTime, time, stance]);

  if (loading)
    return (
      <div className="relative w-72 h-24 px-auto uppercase font-bold">
        <div className="flex h-full justify-center items-center gap-2">
          <Loader />
          Loading Data
        </div>
      </div>
    );

  return (
    <div className="w-72 flex flex-col gap-2">
      <div className="grid grid-cols-[2rem_1fr_2rem] gap-2 items-center">
        <img src={friendly ? InterfaceIcons.Fleet : InterfaceIcons.EnemyFleet} className={`pixel-images w-full`} />
        <div className="flex flex-col text-sm font-bold uppercase">
          <p>{fleetStats.title}</p>
          <FleetStateText />
          {!!homeAsteroid && (
            <p className="text-xs">
              <span className="opacity-80">Home:</span>{" "}
              <span className="text-secondary">{entityToRockName(homeAsteroid as Entity)}</span>{" "}
            </p>
          )}
        </div>
        {inGracePeriod && (
          <div className="flex flex-col font-bold gap-1 text-xs items-center">
            <IconLabel imageUri={InterfaceIcons.Grace} className={`pixel-images w-3 h-3`} />
            {formatTimeShort(duration)}
          </div>
        )}
        {!inGracePeriod && inCooldown && (
          <div className="flex flex-col font-bold gap-1 text-xs items-center">
            <img src={InterfaceIcons.Cooldown} className={`pixel-images w-6 h-6`} />
            {formatTimeShort(cooldownDuration)}
          </div>
        )}
      </div>
      <SecondaryCard className="grid grid-cols-2 text-xs gap-y-1 gap-x-4">
        <div className="flex justify-between">
          <p className="text-accent">ATTACK</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, fleetStats.attack, { short: true })}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-accent">COUNTER</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, fleetStats.defense, { short: true })}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-accent">HEALTH</p>
          <p className="text-end"> {formatResourceCount(EntityType.Iron, fleetStats.hp, { short: true })}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-accent">CARGO</p>
          <p className="text-end">{formatResourceCount(EntityType.Iron, fleetStats.cargo, { short: true })}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-accent">SPEED</p>
          <p className="text-end">{formatNumber(fleetStats.speed)}</p>
        </div>
        <div className="flex justify-between">
          <p className="text-accent">DECRYPT</p>
          <p className="text-end">{formatResourceCount(EntityType.Iron, fleetStats.decryption, { short: true })}</p>
        </div>
      </SecondaryCard>
      <FleetResources entity={entity} />
    </div>
  );
};

const ResourceDisplay = ({ type, count }: { type: Entity; count: bigint }) => {
  if (count == 0n) return null;
  return (
    <IconLabel
      key={`show-resource-${type}`}
      imageUri={EntityToResourceImage[type]}
      text={formatResourceCount(type, count, { short: true })}
    />
  );
};

const UnitDisplay = ({ type, count }: { type: Entity; count: bigint }) => {
  if (count == 0n) return null;
  return (
    <IconLabel
      key={`show-unit-${type}`}
      imageUri={EntityToUnitImage[type]}
      text={formatResourceCount(type, count, { short: true })}
    />
  );
};

// exluding units for now
const FleetResources = ({ entity, loading = false }: { entity: Entity; loading?: boolean }) => {
  const units = useUnitCounts(entity, loading);
  const resources = useFullResourceCounts(entity, loading);

  const hasUnits = !!units && [...units.values()].some((count) => count > 0n);
  const hasResources =
    resources.size > 0 && [...ResourceStorages].some((type) => (resources.get(type)?.resourceCount ?? 0n) >= 0n);
  if (!hasResources && !hasUnits) return null;
  return (
    <SecondaryCard className="text-xs grid grid-cols-3 gap-1 place-items-center">
      {hasResources &&
        [...ResourceStorages].map((type) => (
          <ResourceDisplay key={`type-${type}`} type={type} count={resources.get(type)?.resourceCount ?? 0n} />
        ))}
      {hasResources && hasUnits && <hr className="col-span-3 w-full border-secondary/50 border-0.5 my-1" />}
      {hasUnits &&
        [...units.entries()].map(([unit, count]) => <UnitDisplay key={`unit-${unit}`} type={unit} count={count} />)}
    </SecondaryCard>
  );
};
