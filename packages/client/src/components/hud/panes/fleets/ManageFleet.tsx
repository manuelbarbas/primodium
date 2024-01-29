import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EFleetStance, EResource } from "contracts/config/enums";
import { FC } from "react";
import { Button } from "src/components/core/Button";
import { TransactionQueueMask } from "src/components/shared/TransactionQueueMask";
import { useMud } from "src/hooks";
import { components } from "src/network/components";
import { disbandFleet } from "src/network/setup/contractCalls/fleetDisband";
import { landFleet } from "src/network/setup/contractCalls/fleetLand";
import { clearFleetStance, setFleetStance } from "src/network/setup/contractCalls/fleetStance";
import { ResourceEntityLookup } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { Hex } from "viem";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { FleetEntityHeader } from "./FleetHeader";
import { useFleetNav } from "./Fleets";

const ManageFleet: FC<{ fleetEntity: Entity }> = ({ fleetEntity }) => {
  const mud = useMud();
  const { BackButton } = useFleetNav();
  const destination = components.FleetMovement.getWithKeys({ entity: fleetEntity as Hex })?.destination;
  const selectedRock = components.SelectedRock.get()?.value;
  const units = components.P_UnitPrototypes.get(undefined, { value: [] }).value.reduce((acc, entity) => {
    const unitCount = components.UnitCount.getWithKeys({
      entity: fleetEntity as Hex,
      unit: entity as Hex,
    })?.value;
    if (!unitCount) return acc;
    acc[entity as Entity] = unitCount;
    return acc;
  }, {} as Record<Entity, bigint>);

  const transportables = components.P_Transportables.get()?.value ?? [];
  const transportableResources = transportables.reduce((acc, transportable) => {
    const entity = ResourceEntityLookup[transportable as EResource];
    const resourceCount = components.ResourceCount.getWithKeys({
      entity: entity as Hex,
      resource: transportable,
    })?.value;
    if (!resourceCount) return acc;
    acc[entity] = resourceCount;
    return acc;
  }, {} as Record<Entity, bigint>);

  const fleetsOnAsteroidQuery = [Has(components.IsFleet), HasValue(components.FleetMovement, { destination })];
  const fleetsOnAsteroid = useEntityQuery(fleetsOnAsteroidQuery);
  const followableFleets = fleetsOnAsteroid.filter(
    (entity) => entity != fleetEntity && !components.FleetStance.get(entity)
  );
  const activeStance = components.FleetStance.use(fleetEntity);

  const handleDefend = () => {
    if (!selectedRock) return;
    if (activeStance?.stance == EFleetStance.Defend) clearFleetStance(mud, fleetEntity);
    setFleetStance(mud, fleetEntity, EFleetStance.Defend, selectedRock);
  };

  const handleBlock = () => {
    if (!selectedRock) return;
    if (activeStance?.stance == EFleetStance.Block) clearFleetStance(mud, fleetEntity);
    setFleetStance(mud, fleetEntity, EFleetStance.Block, selectedRock);
  };

  const handleFollow = (target: Entity) => {
    if (activeStance?.stance == EFleetStance.Follow && activeStance?.target == target)
      clearFleetStance(mud, fleetEntity);
    setFleetStance(mud, fleetEntity, EFleetStance.Follow, target);
  };
  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-4 gap-4 h-full overflow-hidden">
        {/* Left Side */}
        <div className="col-span-3 flex flex-col gap-4 h-full relative">
          <div className="bg-base-100 p-4">
            <FleetEntityHeader entity={fleetEntity} />
          </div>
          <div className="flex-1 flex flex-col bg-base-100 p-4 gap-2">
            <p className="uppercase text-xs opacity-50 font-bold">UNITS</p>
            {Object.entries(units).length > 0 ? (
              <div className="grid grid-cols-4 grid-rows-2 gap-2">
                {Object.entries(units).map(([unit, count]) => {
                  if (count <= 0n) return null;
                  return <ResourceIcon key={`unit-${unit}`} resource={unit as Entity} amount={count.toString()} />;
                })}
              </div>
            ) : (
              <p className="w-full h-full grid place-items-center text-xs uppercase font-bold">No Units</p>
            )}

            <Button className="btn-primary btn-xs w-fit self-end">Transfer Units</Button>
          </div>
          <div className="flex-1 flex flex-col bg-base-100 p-4 gap-2">
            <p className="uppercase text-xs opacity-50 font-bold">RESOURCES</p>
            {Object.entries(transportableResources).length > 0 ? (
              <div className="flex-1 flex flex-col bg-base-100 p-4 grid grid-cols-4 grid-rows-2 gap-2">
                {Object.entries(transportableResources).map(([resource, count]) => {
                  if (count <= 0n) return null;
                  return (
                    <ResourceIcon
                      key={`resource-${resource}`}
                      resource={resource as Entity}
                      amount={count.toString()}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="w-full h-full grid place-items-center text-xs uppercase font-bold">No Resources</p>
            )}
            <Button className="btn-primary btn-xs self-end w-fit">Transfer Resources</Button>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex flex-col col-span-1 overflow-hidden gap-2">
          <TransactionQueueMask
            queueItemId={"FleetStance" as Entity}
            className="h-full bg-base-100 flex flex-col p-4 gap-1 overflow-hidden"
          >
            <div className="bg-neutral uppercase text-sm font-bold text-center">STANCE</div>
            <div className="flex items-center gap-1 uppercase font-bold">
              DEFEND
              {activeStance?.stance == EFleetStance.Defend && (
                <p className="opacity-50 text-xs font-bold uppercase">(active)</p>
              )}
            </div>
            <p className="italic opacity-50 text-xs">Use this fleet{"'"}s units to the defense of this space rock</p>
            <Button className="btn btn-primary btn-sm" onClick={handleDefend}>
              {activeStance?.stance == EFleetStance.Defend ? "STOP DEFENDING" : "DEFEND"}
            </Button>
            <div className="flex items-center gap-1 uppercase font-bold">
              BLOCK
              {activeStance?.stance == EFleetStance.Block && (
                <p className="opacity-50 text-xs font-bold uppercase">(active)</p>
              )}
            </div>
            <p className="italic opacity-50 text-xs">Stop other fleets from leaving this space rock</p>
            <Button className="btn btn-primary btn-sm" onClick={handleBlock}>
              {activeStance?.stance == EFleetStance.Block ? "STOP BLOCKING" : "BLOCK"}
            </Button>
            <div className="flex items-center gap-1 uppercase font-bold">
              FOLLOW
              {activeStance?.stance == EFleetStance.Follow && (
                <p className="opacity-50 text-xs font-bold uppercase">(active)</p>
              )}
            </div>
            <p className="italic opacity-50 text-xs">Automatically move whenever another fleet moves</p>
            <div className="flex flex-col h-full overflow-y-auto scrollbar">
              {followableFleets.length > 0 ? (
                followableFleets.map((target, i) => (
                  <div
                    className="w-full p-2 bg-neutral flex justify-between items-center"
                    key={`follow-${target}-${i}`}
                  >
                    <p className="text-sm font-bold">{entityToRockName(target)}</p>
                    <Button className="btn btn-primary btn-sm" onClick={() => handleFollow(target)}>
                      {activeStance?.target === target ? "UN" : ""}FOLLOW
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-error font-bold uppercase text-xs">No fleets to follow</div>
              )}
            </div>
          </TransactionQueueMask>
          <div className="flex flex-col gap-2">
            <Button className="btn btn-primary btn-sm">ATTACK</Button>
            <Button
              className="btn btn-primary btn-sm"
              onClick={() => selectedRock && landFleet(mud, fleetEntity, selectedRock)}
            >
              LAND
            </Button>
            <Button className="btn btn-error btn-sm" onClick={() => disbandFleet(mud, fleetEntity)}>
              DISBAND
            </Button>
          </div>
        </div>
      </div>
      <BackButton className="mt-2 self-start">BACK</BackButton>
    </div>
  );
};

export default ManageFleet;
