import { Card, SecondaryCard } from "@/components/core/Card";
import { Tooltip } from "@/components/core/Tooltip";
import { useMud } from "@/hooks";
import { usePrimodium } from "@/hooks/usePrimodium";
import { components } from "@/network/components";
import { getBuildingImageFromType } from "@/util/building";
import { getEntityTypeName } from "@/util/common";
import { EntityType } from "@/util/constants";
import { EntityToUnitImage } from "@/util/mappings";
import { formatResourceCount } from "@/util/number";
import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { toRomanNumeral } from "src/util/common";
import { Hex } from "viem";

export const Hangar = ({ className = "" }: { className?: string }) => {
  const activeRock = components.ActiveRock.use()?.value;
  const player = useMud().playerAccount.entity;
  const ownedByPlayer = components.OwnedBy.use(activeRock)?.value == player;
  const hangar = components.Hangar.use(activeRock);
  const primodium = usePrimodium();

  const imgShadow = { filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))" };

  const getCounts = (units: Entity[]) => {
    if (!hangar) return { total: 0n, unitCounts: {} };
    return units.reduce(
      (acc, unit) => {
        const index = hangar.units.indexOf(unit);
        if (index === -1) return acc;
        const count = hangar.counts[index];
        console.log({ unit, count });
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

  console.log({ marines, drones });
  if (!activeRock) return null;
  console.log({ hangar });
  if (!hangar || hangar.units.length === 0) {
    return (
      <Card className={`${className}`}>
        <div className="w-full h-full flex flex-col justify-center items-center gap-4">
          <p>No Units Available</p>
          {ownedByPlayer && (
            <div className="flex flex-col gap-2 justify-center items-center">
              <p className="text-xs opacity-70">Train Units at</p>
              <div className="flex gap-4">
                <Tooltip tooltipContent="Workshop" direction="bottom">
                  <img
                    src={getBuildingImageFromType(primodium, EntityType.Workshop)}
                    alt="Workshop"
                    className="w-12 h-12"
                    style={imgShadow}
                  />
                </Tooltip>
                <Tooltip tooltipContent="Drone Factory" direction="bottom">
                  <img
                    src={getBuildingImageFromType(primodium, EntityType.DroneFactory)}
                    alt="DroneFactory"
                    className="w-12 h-12"
                    style={imgShadow}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card noDecor className={`${className}`}>
      <div className="h-full w-full flex flex-col gap-1 overflow-y-auto scrollbar ">
        {marines.total > 0n && (
          <>
            <p className="opacity-60 text-xs">Marines</p>
            <SecondaryCard className="gap-1">
              {Object.entries(marines.unitCounts).map(([unit, count], i) => (
                <div key={`marine-${i}`} className="flex gap-2 items-center">
                  <img
                    src={EntityToUnitImage[unit]}
                    alt={getEntityTypeName(unit as Entity)}
                    className="w-8 h-8"
                    style={imgShadow}
                  />
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
                  <img
                    src={EntityToUnitImage[unit]}
                    alt={getEntityTypeName(unit as Entity)}
                    className="w-8 h-8"
                    style={imgShadow}
                  />
                  <p>{formatResourceCount(unit as Entity, count)}</p>
                  <p className="opacity-50 text-xs">{getEntityTypeName(unit as Entity)}</p>
                </div>
              ))}
            </SecondaryCard>
          </>
        )}
        {colonyShipCount > 0n && (
          <SecondaryCard variant="highlight" className="flex flex-row gap-4 items-center text-sm">
            <img
              src={EntityToUnitImage[EntityType.ColonyShip]}
              alt={getEntityTypeName(EntityType.ColonyShip)}
              className="h-8"
              style={imgShadow}
            />
            {colonyShipCount.toLocaleString()} Colony Ships
          </SecondaryCard>
        )}
      </div>
    </Card>
  );
};

export const Unit = ({ unit, asteroid, className = "" }: { unit: Entity; asteroid: Entity; className?: string }) => {
  const level = components.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
  return (
    <p className={className}>
      {getEntityTypeName(unit)} {toRomanNumeral(Number(level + 1n))}
    </p>
  );
};
