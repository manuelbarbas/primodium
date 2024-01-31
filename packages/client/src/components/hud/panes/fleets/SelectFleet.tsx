import { useEntityQuery } from "@latticexyz/react";
import { Has, HasValue } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { FleetButton } from "../../modals/fleets/FleetButton";

export const FriendlyFleets: React.FC = () => {
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const query = [Has(components.IsFleet), HasValue(components.OwnedBy, { value: selectedRock })];
  const friendlyFleets = useEntityQuery(query);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="w-full text-xs overflow-y-auto grid grid-cols-2 gap-2">
        {friendlyFleets.length === 0
          ? null
          : friendlyFleets.map((entity) => {
              const fleet = components.FleetMovement.get(entity);

              if (!fleet) return null;

              return <FleetButton key={entity} fleetEntity={entity} />;
            })}
      </div>
    </div>
  );
};
