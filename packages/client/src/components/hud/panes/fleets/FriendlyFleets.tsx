import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { useState } from "react";
import { Button } from "src/components/core/Button";
import { SecondaryCard } from "src/components/core/Card";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { Fleet } from "../../modals/fleets/Fleet";

export const FriendlyFleets: React.FC = () => {
  const [timeSort, setTimeSort] = useState<"asc" | "desc" | null>(null);
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const query = [Has(components.IsFleet), HasValue(components.OwnedBy, { value: selectedRock })];
  const friendlyFleets = useEntityQuery(query); // Combine and sort fleets

  return (
    <div className="w-full text-xs h-full overflow-y-auto flex flex-col gap-2">
      <div className=" flex gap-1 items-center">
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
        <p className="w-full text-right uppercase font-bold">{friendlyFleets?.length} fleets</p>
      </div>
      {friendlyFleets.length === 0 ? (
        <SecondaryCard className="text-center font-bold w-auto flex-grow items-center justify-center">
          <p className="opacity-50 uppercase">no friendly fleets</p>
        </SecondaryCard>
      ) : (
        <>
          {friendlyFleets.map((entity) => {
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
      <Navigator.NavButton to="CreateFleet" className="btn-primary btn-sm">
        Create New Fleet{" "}
      </Navigator.NavButton>
    </div>
  );
};
