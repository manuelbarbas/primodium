import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Modal } from "src/components/core/Modal";
import { useMud } from "src/hooks";
import { useOrbitingFleets } from "src/hooks/useOrbitingFleets";
import { components } from "src/network/components";
import { FleetEntityHeader } from "./FleetHeader";

export const SelectFleet: React.FC = () => {
  const origin = components.Send.use()?.origin ?? singletonEntity;
  const {
    playerAccount: { entity: playerEntity },
  } = useMud();

  const orbitingFleets = useOrbitingFleets(origin, playerEntity);
  if (origin == singletonEntity) return <div>Select an origin</div>;
  return (
    <div className="flex flex-col gap-2 p-2 h-full w-full">
      <div className="w-full text-xs overflow-y-auto grid grid-cols-2 gap-2 h-full w-full">
        {orbitingFleets.length === 0
          ? null
          : orbitingFleets.map((entity) => {
              const fleet = components.FleetMovement.get(entity);

              if (!fleet) return null;

              return (
                <Modal.CloseButton
                  key={`select-fleet-${entity}`}
                  className="btn-primary"
                  onClick={() => components.Send.setFleetEntity(entity)}
                >
                  <FleetEntityHeader entity={entity} className="bg-base-100" />
                </Modal.CloseButton>
              );
            })}
      </div>
      <Modal.CloseButton className="btn-primary btn-sm" onClick={() => components.Send.clear()}>
        Cancel
      </Modal.CloseButton>
    </div>
  );
};
