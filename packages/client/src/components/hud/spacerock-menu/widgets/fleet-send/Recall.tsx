import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useCallback } from "react";
import { Badge } from "src/components/core/Badge";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { IconLabel } from "src/components/core/IconLabel";
import { Fleet } from "src/components/hud/modals/fleets/Fleet";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { recallStationedUnits } from "src/network/setup/contractCalls/recall";
import { formatNumber } from "src/util/common";
import { BackgroundImage, UnitEnumLookup } from "src/util/constants";
import { getRockDefense } from "src/util/defense";
import { getSpaceRockImage, getSpaceRockName } from "src/util/spacerock";

export const Unit: React.FC<{ unit: Entity; count: bigint }> = ({ unit, count }) => {
  if (count === 0n) return null;
  return (
    <SecondaryCard
      className={`flex flex-col items-center group hover:scale-105 transition-transform w-full h-full border-none justify-center pointer-events-none`}
    >
      <img
        src={BackgroundImage.get(unit)?.at(0) ?? "/img/icons/debugicon.png"}
        className={`h-[64px] bg-neutral p-2 border border-secondary pixel-images`}
      />

      <Badge className="font-bold -mt-3 border-secondary">
        x{formatNumber(count, { short: true, fractionDigits: 2 })}
      </Badge>
    </SecondaryCard>
  );
};

export const TargetInfo = () => {
  const selectedSpacerock = components.SelectedRock.use()?.value;
  const img = getSpaceRockImage(selectedSpacerock ?? singletonEntity);
  const name = getSpaceRockName(selectedSpacerock ?? singletonEntity);
  const coord = components.Position.get(selectedSpacerock ?? singletonEntity) ?? { x: 0, y: 0 };
  const def = getRockDefense(selectedSpacerock ?? singletonEntity);

  return (
    <div className="flex flex-col gap-1">
      {/* <p className="text-xs font-bold opacity-75 pb-1">TARGET</p> */}
      <Badge className="flex gap-1 w-full uppercase font-bold text-sm items-center">
        <IconLabel imageUri={img} className="" text={`${name}`} />
      </Badge>
      <div className="flex gap-1">
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">
            LOC:[{coord.x}, {coord.y}]
          </p>
        </Badge>
        <Badge className="flex gap-1 w-full uppercase font-bold text-xs items-center">
          <p className="scale-95 opacity-50">DEF:{formatNumber(def.points, { short: true, fractionDigits: 2 })}</p>
        </Badge>
      </div>
    </div>
  );
};

export const Recall = ({ rock }: { rock: Entity }) => {
  const { network } = useMud();
  const units = components.Hangar.use(rock, {
    units: [],
    counts: [],
  });

  const ownedByPlayer = components.OwnedBy.get(rock)?.value === network.playerEntity;
  const arrivals = components.Arrival.use({ destination: rock, from: network.playerEntity, onlyOrbiting: true });
  const getUnitCount = useCallback(
    (unit: Entity) => {
      if (!units) return 0n;
      const index = units.units.indexOf(unit);
      if (index === -1) return 0n;
      return units.counts[index];
    },
    [units]
  );

  const unitCounts = Object.keys(UnitEnumLookup).map((unit) => {
    return {
      unit: unit as Entity,
      count: getUnitCount(unit as Entity),
    };
  });
  const totalUnits = unitCounts.reduce((acc, curr) => acc + curr.count, 0n);

  return (
    <div className="flex flex-col gap-1 border-none h-96">
      <TargetInfo />
      <div className="grid grid-cols-2 gap-2 border-none w-full pointer-events-auto h-full">
        <SecondaryCard className={`flex flex-col gap-2 w-full overflow-y-none ${!ownedByPlayer ? "col-span-2" : ""}`}>
          <p className="font-bold text-center ">Orbiting Fleets</p>
          <div className="flex flex-col h-full w-full overflow-y-scroll scrollbar">
            {arrivals.length == 0 && (
              <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
                <p className="opacity-50 uppercase">no orbiting fleets</p>
              </SecondaryCard>
            )}
            {arrivals.length > 0 &&
              arrivals.map(
                (arrival) =>
                  arrival && (
                    <Fleet
                      arrivalEntity={arrival.entity}
                      arrivalTime={arrival.arrivalTime}
                      key={arrival.entity}
                      destination={rock}
                      small
                      sendType={arrival.sendType}
                    />
                  )
              )}
          </div>
        </SecondaryCard>

        {ownedByPlayer && (
          <SecondaryCard className="flex flex-col w-full space-y-1 h-full">
            <p className="font-bold text-center">Stationed Units</p>
            {totalUnits == 0n && (
              <SecondaryCard className="w-full h-full flex text-xs items-center justify-center font-bold">
                <p className="opacity-50 uppercase">no stationed units</p>
              </SecondaryCard>
            )}

            {totalUnits !== 0n && (
              <div className="grid gap-1 h-full grid-cols-4 grid-rows-2">
                {unitCounts.map((unit) => (
                  <Unit unit={unit.unit} count={unit.count} key={`counts-${unit.unit}`} />
                ))}
              </div>
            )}
            <Button onClick={() => recallStationedUnits(rock, network)} disabled={totalUnits == 0n}>
              Recall Stationed Units
            </Button>
          </SecondaryCard>
        )}
      </div>
    </div>
  );
};
