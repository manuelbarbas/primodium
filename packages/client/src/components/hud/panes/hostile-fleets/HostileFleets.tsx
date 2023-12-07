import { ComponentValue, Entity } from "@latticexyz/recs";
import { ESendType } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Fleet } from "../../modals/fleets/Fleet";

export const HostileFleets: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;

  // State for sorting and filtering
  const [timeSort, setTimeSort] = useState<"asc" | "desc" | null>(null);
  const [fleetStatus, setFleetStatus] = useState<"orbiting" | "transiting" | null>(null);

  const fleets = components.Arrival.useAllWith({
    to: playerEntity,
  });
  const currentTime = components.Time.use()?.value ?? 0n;

  // Apply sorting and filtering logic
  const sortedAndFilteredFleets = useMemo(() => {
    return fleets
      .reduce((acc, entity) => {
        const fleet = components.Arrival.getEntity(entity);
        if (!fleet || fleet.sendType === ESendType.Reinforce) return acc;

        const isOrbiting = fleet.arrivalTime <= currentTime;
        if ((fleetStatus === "orbiting" && !isOrbiting) || (fleetStatus === "transiting" && isOrbiting)) {
          return acc;
        }

        return [...acc, { ...fleet, entity }];
      }, [] as (ComponentValue<typeof components.Arrival.schema> & { entity: Entity })[])
      .sort((a, b) => {
        if (!timeSort) return 0;
        const timeA = a.arrivalTime ?? 0n;
        const timeB = b.arrivalTime ?? 0n;
        return Number(timeSort === "asc" ? timeA - timeB : timeB - timeA);
      });
  }, [fleets, timeSort, fleetStatus, currentTime]);

  return (
    <div className="w-full text-xs h-full overflow-y-auto flex flex-col gap-2">
      {/* Filter and Sorting Controls */}
      <div className="flex gap-1 items-center">
        {/* Orbiting/Transiting Filter */}
        <Button
          className="btn-primary btn-xs"
          selected={fleetStatus === "orbiting"}
          onClick={() => setFleetStatus(fleetStatus === "orbiting" ? null : "orbiting")}
        >
          Orbiting
        </Button>
        <Button
          className="btn-primary btn-xs"
          selected={fleetStatus === "transiting"}
          onClick={() => setFleetStatus(fleetStatus === "transiting" ? null : "transiting")}
        >
          In Transit
        </Button>

        <span className="w-6"></span>
        <Button
          className="btn-primary btn-xs"
          selected={timeSort === "asc"}
          onClick={() => setTimeSort(timeSort === "asc" ? null : "asc")}
        >
          Time (asc)
        </Button>
        <Button
          className="btn-primary btn-xs"
          selected={timeSort === "desc"}
          onClick={() => setTimeSort(timeSort === "desc" ? null : "desc")}
        >
          Time (desc)
        </Button>

        <p className="w-full text-right uppercase font-bold">{sortedAndFilteredFleets?.length} fleets</p>
      </div>

      {sortedAndFilteredFleets.length === 0 ? (
        <SecondaryCard className="text-center font-bold w-auto flex-grow items-center justify-center">
          <p className="opacity-50 uppercase">no hostile fleets</p>
        </SecondaryCard>
      ) : (
        <>
          {sortedAndFilteredFleets.map((fleet) => (
            <Fleet
              key={fleet.entity.toString()}
              arrivalEntity={fleet.entity}
              arrivalTime={fleet.arrivalTime}
              destination={fleet.destination}
              sendType={fleet.sendType}
              outgoing={false}
            />
          ))}
        </>
      )}
    </div>
  );
};
