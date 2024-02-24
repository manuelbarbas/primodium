import { Scenes } from "@game/constants";
import { Entity } from "@latticexyz/recs";
import { EFleetStance } from "contracts/config/enums";
import { FC, useMemo } from "react";
import { Button } from "src/components/core/Button";
import { Modal } from "src/components/core/Modal";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { useFullResourceCounts } from "src/hooks/useFullResourceCount";
import { usePrimodium } from "src/hooks/usePrimodium";
import { useUnitCounts } from "src/hooks/useUnitCount";
import { components } from "src/network/components";
import { disbandFleet } from "src/network/setup/contractCalls/fleetDisband";
import { landFleet } from "src/network/setup/contractCalls/fleetLand";
import { clearFleetStance, setFleetStance } from "src/network/setup/contractCalls/fleetStance";
import { formatNumber, formatResourceCount } from "src/util/number";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { FleetEntityHeader } from "./FleetHeader";
import { useFleetNav } from "./Fleets";

const ManageFleet: FC<{ fleetEntity: Entity }> = ({ fleetEntity }) => {
  const mud = useMud();
  const api = usePrimodium().api(Scenes.Starmap);
  const scene = api.scene.getScene(Scenes.Starmap);

  const { BackButton, NavButton } = useFleetNav();

  const units = useUnitCounts(fleetEntity);
  const resources = useFullResourceCounts(fleetEntity);

  const totalUnits = useMemo(() => [...units.values()].reduce((acc, cur) => acc + cur, 0n), [units]);
  const time = components.Time.use()?.value ?? 0n;
  const movement = components.FleetMovement.use(fleetEntity);

  const activeStance = components.FleetStance.use(fleetEntity);
  const cannotDoAnything = totalUnits <= 0n || !movement || movement.arrivalTime > time;

  const handleDefend = () => {
    const position = movement?.destination as Entity;
    if (!position) return;
    if (activeStance?.stance == EFleetStance.Defend) clearFleetStance(mud, fleetEntity);
    else setFleetStance(mud, fleetEntity, EFleetStance.Defend, position);
  };

  const handleBlock = () => {
    const position = movement?.destination as Entity;
    if (!position) return;
    if (activeStance?.stance == EFleetStance.Block) clearFleetStance(mud, fleetEntity);
    else setFleetStance(mud, fleetEntity, EFleetStance.Block, position);
  };

  return (
    <div className="w-full h-full flex flex-col gap-2 p-2">
      {/*Header*/}
      <div className="flex items-center justify-between gap-2 w-full uppercase font-bold text-xs text-left">
        <p className="opacity-50">Manage Fleet</p>
      </div>

      <div className="grid grid-cols-4 gap-2 h-full overflow-hidden">
        {/* Left Side */}
        <div className="col-span-3 flex flex-col gap-2 h-full relative">
          <div className="bg-base-100 p-4">
            <FleetEntityHeader entity={fleetEntity} />
          </div>
          <div className="grid grid-rows-2 h-full gap-2">
            <div className="relative flex flex-col h-full bg-base-100 p-2 gap-2">
              <p className="uppercase text-xs opacity-50 font-bold">UNITS</p>
              <div className="flex-1 flex flex-col bg-base-100 grid grid-cols-4 grid-rows-2 gap-2">
                {Array(8)
                  .fill(0)
                  .map((_, index) => {
                    if (index >= units.size) {
                      return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
                    }
                    const [unit, count] = [...units.entries()][index];

                    return <ResourceIcon key={`unit-${unit}`} resource={unit as Entity} amount={formatNumber(count)} />;
                  })}
              </div>
            </div>
            <div className="relative flex flex-col bg-base-100 p-2 gap-2">
              <p className="uppercase text-xs opacity-50 font-bold">RESOURCES</p>
              <div className="flex-1 flex flex-col bg-base-100 grid grid-cols-4 grid-rows-2 gap-2">
                {Array(8)
                  .fill(0)
                  .map((_, index) => {
                    if (index >= resources.size) {
                      return <div className="w-full h-full bg-white/10 opacity-50" key={`unit-from-${index}`} />;
                    }
                    const [resource, data] = [...resources.entries()][index];

                    return (
                      <ResourceIcon
                        key={`resource-${resource}`}
                        resource={resource as Entity}
                        amount={formatResourceCount(resource, data.resourceCount)}
                      />
                    );
                  })}
              </div>
            </div>
          </div>
          <NavButton
            className="btn-primary w-fit btn-sm "
            goto="transfer"
            from={fleetEntity}
            to={undefined}
            onClick={() =>
              movement?.destination && components.ActiveRock.set({ value: movement.destination as Entity })
            }
          >
            Transfer Units and Resources
          </NavButton>
        </div>
        {/* Right Side */}
        <div className="flex flex-col grow col-span-1 overflow-hidden gap-2">
          <TransactionQueueMask
            queueItemId={"FleetStance" as Entity}
            className="bg-base-100 flex flex-col p-4 gap-1 overflow-hidden h-full"
          >
            <div className="bg-neutral uppercase text-sm font-bold text-center">STANCE</div>
            <div className="flex items-center gap-1 uppercase font-bold">
              DEFEND
              {activeStance?.stance == EFleetStance.Defend && (
                <p className="opacity-50 text-xs font-bold uppercase">(active)</p>
              )}
            </div>
            <p className="italic opacity-50 text-xs">Use this fleet{"'"}s units to defend this space rock</p>
            <Button className="btn btn-primary btn-sm" onClick={handleDefend} disabled={cannotDoAnything}>
              {activeStance?.stance == EFleetStance.Defend ? "STOP DEFENDING" : "DEFEND"}
            </Button>
            <div className="flex items-center gap-1 uppercase font-bold">
              BLOCK
              {activeStance?.stance == EFleetStance.Block && (
                <p className="opacity-50 text-xs font-bold uppercase">(active)</p>
              )}
            </div>
            <p className="italic opacity-50 text-xs">Stop other fleets from leaving this space rock</p>
            <Button className="btn btn-primary btn-sm" onClick={handleBlock} disabled={cannotDoAnything}>
              {activeStance?.stance == EFleetStance.Block ? "STOP BLOCKING" : "BLOCK"}
            </Button>
          </TransactionQueueMask>
          <div className="flex flex-col gap-2">
            <Modal.CloseButton
              className="btn btn-primary btn-sm"
              disabled={cannotDoAnything}
              onClick={() => {
                if (!scene) return;
                components.Attack.reset();
                components.Send.setOrigin(fleetEntity);
                api.util.openMap();
              }}
            >
              SEND
            </Modal.CloseButton>

            <Modal.CloseButton
              className="btn btn-primary btn-sm"
              disabled={cannotDoAnything}
              onClick={async () => {
                if (!scene) return;
                components.Send.reset();
                components.Attack.setOrigin(fleetEntity);
                await api.util.openMap();

                const fleetDestinationEntity = components.FleetMovement.get(fleetEntity)?.destination as Entity;
                if (!fleetDestinationEntity) return;
                const fleetDestinationPosition = components.Position.get(fleetDestinationEntity);
                if (!fleetDestinationPosition) return;
                api.camera.pan(fleetDestinationPosition);
              }}
            >
              ATTACK
            </Modal.CloseButton>
            <TransactionQueueMask queueItemId={"landFleet" as Entity}>
              <Button
                className="btn btn-primary btn-sm w-full"
                onClick={() => movement?.destination && landFleet(mud, fleetEntity, movement.destination as Entity)}
                disabled={totalUnits <= 0n}
              >
                LAND
              </Button>
            </TransactionQueueMask>
            <TransactionQueueMask queueItemId={"disband" as Entity}>
              <Button
                className="btn btn-error btn-sm w-full"
                onClick={() => disbandFleet(mud, fleetEntity)}
                tooltipDirection="bottom"
                tooltip="remove all units and resources and return home"
              >
                {totalUnits <= 0n ? "RECALL" : "CLEAR AND RECALL"}
              </Button>
            </TransactionQueueMask>
          </div>
        </div>
      </div>
      <BackButton className="self-start">BACK</BackButton>
    </div>
  );
};

export default ManageFleet;
