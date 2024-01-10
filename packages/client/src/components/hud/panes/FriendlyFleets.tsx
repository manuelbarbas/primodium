import { ESendType } from "contracts/config/enums";
import { useMemo, useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Fleet } from "../modals/fleets/Fleet";

export const ReinforcementFleets: React.FC = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  // State for sorting
  const [typeSort, setTypeSort] = useState<ESendType | null>(null);
  const [timeSort, setTimeSort] = useState<"asc" | "desc" | null>(null);

  // ... existing code for fetching fleets
  const reinforcementFleets = components.Arrival.useAllWith({
    to: playerEntity,
    sendType: ESendType.Reinforce,
  });

  const raidFleets = components.Arrival.useAllWith({
    from: playerEntity,
    sendType: ESendType.Raid,
  });
  const invadeFleets = components.Arrival.useAllWith({
    from: playerEntity,
    sendType: ESendType.Invade,
  });
  // Combine and sort fleets
  const sortedFleets = useMemo(() => {
    let sorted = [...reinforcementFleets, ...raidFleets, ...invadeFleets];

    // Sort by type
    if (typeSort) {
      sorted = sorted.filter((fleet) => components.Arrival.getEntity(fleet)?.sendType === typeSort);
    }

    // Sort by time
    if (timeSort) {
      sorted.sort((a, b) => {
        const timeA = components.Arrival.getEntity(a)?.arrivalTime ?? 0n;
        const timeB = components.Arrival.getEntity(b)?.arrivalTime ?? 0n;
        return Number(timeSort === "asc" ? timeA - timeB : timeB - timeA);
      });
    }

    return sorted;
  }, [reinforcementFleets, raidFleets, invadeFleets, typeSort, timeSort]);

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
            const fleet = components.Arrival.getEntity(entity);

            if (!fleet) return null;

            return (
              <Fleet
                key={entity}
                arrivalEntity={entity}
                arrivalTime={fleet.arrivalTime}
                destination={fleet.destination}
                sendType={fleet.sendType}
              />
            );
          })}
        </>
      )}
    </div>
  );
};
