import { Entity } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { useMemo } from "react";
import { Card } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Loader } from "src/components/core/Loader";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { useInGracePeriod } from "src/hooks/useInGracePeriod";
import { useSyncStatus } from "src/hooks/useSyncStatus";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { EntityType, ResourceImage } from "src/util/constants";
import { entityToFleetName } from "src/util/name";
import { formatNumber, formatResourceCount, formatTime, formatTimeShort } from "src/util/number";
import { getFleetStats } from "src/util/unit";

export const FleetHover: React.FC<{ entity: Entity }> = ({ entity }) => {
  const { loading, exists } = useSyncStatus(entity);
  const fleetStats = getFleetStats(entity);
  const units = useUnitCounts(entity, loading || !exists);
  const resources = useFullResourceCounts(entity, loading || !exists);
  const movement = components.FleetMovement.use(entity);
  const time = components.Time.use()?.value ?? 0n;
  const stance = components.FleetStance.use(entity);
  const { inGracePeriod, duration } = useInGracePeriod(entity);

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

  if (loading || !exists)
    return (
      <Card className="relative flex items-center justify-center w-56 h-24 px-auto font-bold">
        <Loader />
        Loading Data...
      </Card>
    );

  return (
    <Card className="ml-5 relative w-56 font-bold">
      <div className="absolute top-0 left-0 w-full h-full topographic-background-sm opacity-50" />
      <div className="flex flex-col gap-1 z-10">
        <div className="flex gap-1 items-center">
          <IconLabel imageUri="/img/icons/outgoingicon.png" className={`pixel-images w-3 h-3 bg-base-100`} />
          <p className="text-sm font-bold uppercase">{fleetStats.title}</p>
        </div>
        <div className="flex gap-1">
          <p className="text-xs bg-primary px-1 w-fit flex items-center uppercase">{fleetStateText}</p>
          {inGracePeriod && (
            <div className="flex bg-primary font-bold border border-secondary/50 gap-2 text-xs p-1 h-4 items-center">
              <IconLabel imageUri="/img/icons/graceicon.png" className={`pixel-images w-3 h-3`} />
              {formatTimeShort(duration)}
            </div>
          )}
        </div>
        {units.size === 0 && (
          <div className="grid place-items-center text-xs gap-1 p-1 text-error uppercase animate-pulse">Empty</div>
        )}
        {units.size !== 0 && (
          <div className="text-xs grid grid-cols-3 gap-1 divide-x divide-primary/50 pt-1 border-t border-t-primary/50">
            <div className="flex flex-col gap-1 p-1">
              {fleetStats.decryption > 0n && (
                <div className="flex gap-1">
                  <p className="text-secondary">DEC</p>
                  {formatResourceCount(EntityType.Iron, fleetStats.decryption, { short: true })}
                </div>
              )}

              <div className="flex gap-1">
                <p className="text-secondary">ATK</p>
                {formatResourceCount(EntityType.Iron, fleetStats.attack, { short: true })}
              </div>
              <div className="flex gap-1">
                <p className="text-secondary">DEF</p>
                {formatResourceCount(EntityType.Iron, fleetStats.defense, { short: true })}
              </div>
              <div className="flex gap-1">
                <p className="text-secondary">CRG</p>
                {formatResourceCount(EntityType.Iron, fleetStats.cargo, { short: true })}
              </div>
              <div className="flex gap-1">
                <p className="text-secondary">HP</p>
                {formatResourceCount(EntityType.Iron, fleetStats.hp, { short: true })}
              </div>
            </div>
            <>
              <div className="flex flex-col gap-1 p-1">
                {[...units.entries()].map(([unit, count]) => (
                  <div key={`unit-${unit}`} className="flex gap-1">
                    <img
                      src={ResourceImage.get(unit as Entity) ?? ""}
                      className={`pixel-images w-4 scale-200 font-bold text-lg pointer-events-none`}
                    />
                    {formatNumber(count, { short: true })}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 p-1">
                {[...resources.entries()].map(([resource, count]) => (
                  <div key={`resource-${resource}`} className="flex gap-1">
                    <img
                      src={ResourceImage.get(resource as Entity) ?? ""}
                      className={`pixel-images w-4 scale-200 font-bold text-lg pointer-events-none`}
                    />
                    {formatResourceCount(resource as Entity, count.resourceCount, { short: true })}
                  </div>
                ))}
              </div>
            </>
          </div>
        )}
      </div>
    </Card>
  );
};
