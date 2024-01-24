import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { ESendType } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";
import { Fleet } from "../../modals/fleets/Fleet";

export const FriendlyFleets: React.FC = () => {
  // State for sorting
  const [typeSort, setTypeSort] = useState<ESendType | null>(null);
  const [timeSort, setTimeSort] = useState<"asc" | "desc" | null>(null);
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  // ... existing code for fetching fleets
  const friendlyFleets = components.FleetMovement.useAllWith({
    origin: selectedRock,
  });
  // Combine and sort fleets
  const sortedFleets = useMemo(() => {
    const sortedFleets = [...friendlyFleets];
    // Sort by time

    if (timeSort) {
      sortedFleets.sort((a, b) => {
        const timeA = components.FleetMovement.get(a)?.arrivalTime ?? 0n;
        const timeB = components.FleetMovement.get(b)?.arrivalTime ?? 0n;
        return Number(timeSort === "asc" ? timeA - timeB : timeB - timeA);
      });
    }

    return sortedFleets;
  }, [friendlyFleets, timeSort]);

  return (
    <div className="w-full text-xs h-full overflow-y-auto flex flex-col gap-2">
      <div className=" flex gap-1 items-center">
        <Button
          className="btn-primary btn-xs"
          selected={typeSort === ESendType.Reinforce}
          onClick={() => setTypeSort(typeSort === ESendType.Reinforce ? null : ESendType.Reinforce)}
        >
          Reinforce
        </Button>
        <Button
          className="btn-primary btn-xs"
          selected={typeSort === ESendType.Invade}
          onClick={() => setTypeSort(typeSort === ESendType.Invade ? null : ESendType.Invade)}
        >
          Invade
        </Button>
        <Button
          className="btn-primary btn-xs"
          selected={typeSort === ESendType.Raid}
          onClick={() => setTypeSort(typeSort === ESendType.Raid ? null : ESendType.Raid)}
        >
          Raid
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
        <p className="w-full text-right uppercase font-bold">{sortedFleets?.length} fleets</p>
      </div>
      {sortedFleets.length === 0 ? (
        <SecondaryCard className="text-center font-bold w-auto flex-grow items-center justify-center">
          <p className="opacity-50 uppercase">no friendly fleets</p>
        </SecondaryCard>
      ) : (
        <>
          {sortedFleets.map((entity) => {
            const fleet = components.FleetMovement.get(entity);

            if (!fleet) return null;

            return (
              <Fleet
                key={entity}
                fleetEntity={entity}
                arrivalTime={fleet.arrivalTime}
                destination={fleet.destination as Entity}
                origin={fleet.origin as Entity}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
