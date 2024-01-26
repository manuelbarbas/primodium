import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { SecondaryCard } from "src/components/core/Card";
import { components } from "src/network/components";
import { Fleet } from "./FleetButton";

export const Outgoingfleets: React.FC = () => {
  const selectedRock = components.SelectedRock.use()?.value ?? singletonEntity;

  const fleets = components.FleetMovement.useAllWith({
    origin: selectedRock,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <SecondaryCard className="h-full flex items-center justify-center font-bold">
          <p className="opacity-50">NO OUTGOING FLEETS</p>
        </SecondaryCard>
      ) : (
        fleets.map((entity) => {
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
        })
      )}
    </div>
  );
};
