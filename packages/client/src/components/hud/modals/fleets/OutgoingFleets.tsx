import { SecondaryCard } from "src/components/core/Card";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { Fleet } from "./Fleet";

export const Outgoingfleets: React.FC = () => {
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const fleets = components.Arrival.useAllWith({
    from: playerEntity,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <SecondaryCard className="h-full flex items-center justify-center font-bold">
          <p className="opacity-50">NO OUTGOING FLEETS</p>
        </SecondaryCard>
      ) : (
        fleets.map((entity) => {
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
        })
      )}
    </div>
  );
};
