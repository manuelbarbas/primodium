import { Card, SecondaryCard } from "@/components/core/Card";
import { Tooltip } from "@/components/core/Tooltip";
import { useBuildingTypeImage } from "@/hooks/image/useBuildingTypeImage";
import { EntityToUnitImage } from "@/util/image";
import { EntityType, formatResourceCount, getEntityTypeName, toRomanNumeral } from "@primodiumxyz/core";
import { useAccountClient, useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { Hex } from "viem";

export const Hangar = ({ className = "" }: { className?: string }) => {
  const { tables } = useCore();
  const activeRock = tables.ActiveRock.use()?.value;
  const player = useAccountClient().playerAccount.entity;
  const ownedByPlayer = tables.OwnedBy.use(activeRock)?.value == player;
  const hangar = tables.Hangar.use(activeRock);

  const getCounts = (units: Entity[]) => {
    if (!hangar) return { total: 0n, unitCounts: {} };
    return units.reduce(
      (acc, unit) => {
        const index = hangar.units.indexOf(unit);
        if (index === -1) return acc;
        const count = hangar.counts[index];
        return { total: acc.total + count, unitCounts: { ...acc.unitCounts, [unit]: hangar.counts[index] } };
      },
      { total: 0n, unitCounts: {} } as { total: bigint; unitCounts: Record<Entity, bigint> }
    );
  };

  const colonyShipCount = useMemo(() => {
    if (!hangar) return 0n;
    const index = hangar.units.indexOf(EntityType.ColonyShip);
    if (index === -1) return 0n;
    return hangar.counts[index];
  }, [hangar]);

  const marines = useMemo(() => getCounts([EntityType.TridentMarine, EntityType.MinutemanMarine]), [hangar]);
  const drones = useMemo(
    () =>
      getCounts([
        EntityType.AnvilDrone,
        EntityType.HammerDrone,
        EntityType.AegisDrone,
        EntityType.StingerDrone,
        EntityType.LightningCraft,
        EntityType.Droid,
      ]),
    [hangar]
  );

  const workshopImage = useBuildingTypeImage(EntityType.Workshop);
  const droneFactoryImage = useBuildingTypeImage(EntityType.DroneFactory);
  if (!activeRock) return null;
  if (!hangar || hangar.counts.every((count) => count === 0n)) {
    return (
      <Card className={`${className}`} noDecor>
        <div className="w-full h-full flex flex-col justify-center items-center gap-4">
          <p>No Units Available</p>
          {ownedByPlayer && (
            <SecondaryCard className="flex flex-col gap-2 justify-center items-center">
              <p className="text-xs opacity-70">Train Units at</p>
              <div className="flex gap-4 justify-center items-center">
                <Tooltip tooltipContent="Workshop" direction="bottom">
                  <img src={workshopImage} alt="Workshop" className="w-12 h-12" />
                </Tooltip>
                <Tooltip tooltipContent="Drone Factory" direction="bottom">
                  <img src={droneFactoryImage} alt="DroneFactory" className="w-12 h-12" />
                </Tooltip>
              </div>
            </SecondaryCard>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card noDecor className={`${className}`}>
      <div className="h-full w-full flex flex-col gap-1 overflow-y-auto scrollbar ">
        <div className="h-full flex flex-col gap-1">
          {marines.total > 0n && (
            <>
              <p className="opacity-60 text-xs">Marines</p>
              <SecondaryCard className="gap-1">
                {Object.entries(marines.unitCounts).map(([unit, count], i) => (
                  <div key={`marine-${i}`} className="flex gap-2 items-center">
                    <img src={EntityToUnitImage[unit]} alt={getEntityTypeName(unit as Entity)} className="w-8 h-8" />
                    <p>{formatResourceCount(unit as Entity, count)}</p>
                    <p className="opacity-50 text-xs">{getEntityTypeName(unit as Entity)}</p>
                  </div>
                ))}
              </SecondaryCard>
            </>
          )}
          {drones.total > 0n && (
            <>
              <p className="opacity-60 text-xs">Drones</p>
              <SecondaryCard className="gap-1">
                {Object.entries(drones.unitCounts).map(([unit, count], i) => (
                  <div key={`drone-${i}`} className="flex gap-2 items-center">
                    <img src={EntityToUnitImage[unit]} alt={getEntityTypeName(unit as Entity)} className="w-8 h-8" />
                    <p>{formatResourceCount(unit as Entity, count)}</p>
                    <p className="opacity-50 text-xs">{getEntityTypeName(unit as Entity)}</p>
                  </div>
                ))}
              </SecondaryCard>
            </>
          )}
        </div>
        {colonyShipCount > 0n && (
          <SecondaryCard className="flex flex-row gap-4 items-center text-sm border-accent hover:border-accent bg-accent/10">
            <img
              src={EntityToUnitImage[EntityType.ColonyShip]}
              alt={getEntityTypeName(EntityType.ColonyShip)}
              className="h-8"
            />
            {colonyShipCount.toLocaleString()} Colony Ships
          </SecondaryCard>
        )}
      </div>
    </Card>
  );
};

export const Unit = ({ unit, asteroid, className = "" }: { unit: Entity; asteroid: Entity; className?: string }) => {
  const { tables } = useCore();
  const level = tables.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
  return (
    <p className={className}>
      {getEntityTypeName(unit)} {toRomanNumeral(Number(level + 1n))}
    </p>
  );
};
