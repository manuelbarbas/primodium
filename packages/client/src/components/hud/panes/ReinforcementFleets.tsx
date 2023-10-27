import { SecondaryCard } from "src/components/core/Card";
import { Fleet } from "./Fleet";
import { components } from "src/network/components";
import { useMud } from "src/hooks";
import { ESendType } from "contracts/config/enums";

export const ReinforcementFleets: React.FC = () => {
  const playerEntity = useMud().network.playerEntity;

  const fleets = components.Arrival.useAllWith({
    to: playerEntity,
    sendType: ESendType.Reinforce,
  });

  return (
    <div className="w-full text-xs space-y-2 h-full overflow-y-auto">
      {fleets.length === 0 ? (
        <SecondaryCard className="h-full flex items-center justify-center font-bold">
          <p className="opacity-50">NO REINFORCMENTS</p>
        </SecondaryCard>
      ) : (
        fleets.map((entity) => {
          const fleet = components.Arrival.get(entity);

          if (!fleet) return null;

          return (
            <Fleet
              key={entity}
              arrivalEntity={entity}
              arrivalTime={fleet.arrivalTime}
              destination={fleet.destination}
              sendType={fleet.sendType}
              outgoing={true}
            />
          );
        })
      )}
    </div>
  );
};
