import { useEntityQuery } from "@latticexyz/react";
import { Entity, Has, HasValue } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Button } from "src/components/core/Button";
import { Navigator } from "src/components/core/Navigator";
import { components } from "src/network/components";
import { ResourceEntityLookup } from "src/util/constants";
import { entityToRockName } from "src/util/name";
import { Hex } from "viem";
import { ResourceIcon } from "../../modals/fleets/ResourceIcon";
import { FleetEntityHeader } from "./FleetHeader";

export const ManageFleet = ({ fleetEntity }: { fleetEntity: Entity }) => {
  const destination = components.FleetMovement.getWithKeys({ entity: fleetEntity as Hex })?.destination;
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

  return (
    <Navigator.Screen title={`manage-fleet-${fleetEntity}`} className="h-full">
      <div className="grid grid-cols-4 gap-4 h-full">
        {/* Left Side */}
        <div className="col-span-3 flex flex-col gap-4 h-full">
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
          </div>
        </div>
        {/* Right Side */}
        <div className="flex flex-col col-span-1">
          <div className="h-full bg-base-100 flex flex-col p-4 gap-1 overflow-hidden">
            <div className="bg-neutral uppercase text-sm font-bold text-center">STANCE</div>
            <p className="uppercase font-bold">DEFEND</p>
            <p className="italic opacity-50 text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            <Button className="btn btn-primary btn-sm">DEFEND</Button>
            <p className="uppercase font-bold">BLOCK</p>
            <p className="italic opacity-50 text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            <Button className="btn btn-primary btn-sm">BLOCK</Button>
            <p className="uppercase font-bold">FOLLOW</p>
            <p className="italic opacity-50 text-xs">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
            <div className="flex flex-col overflow-y-auto">
              {fleetsOnAsteroid.map((fleet, i) => (
                <div className="w-full p-2 bg-neutral flex justify-between items-center" key={`follow-${fleet}-${i}`}>
                  <p className="text-sm font-bold">{entityToRockName(fleet)}</p>
                  <Button className="btn btn-primary btn-sm">FOLLOW</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button className="btn btn-primary">ATTACK</Button>
            <Button className="btn btn-primary">LAND</Button>
            <Button className="btn btn-error">DISBAND</Button>
          </div>
        </div>
      </div>
      <Navigator.BackButton className="mt-2">BACK</Navigator.BackButton>
    </Navigator.Screen>
  );
};
