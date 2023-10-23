import { Entity, Type } from "@latticexyz/recs";
import { world } from "src/network/world";
import { SetupNetworkResult } from "../../types";
import { createExtendedComponent } from "./ExtendedComponent";
import { ExtendedContractComponents } from "./extendComponents";
import { components } from "src/network/components";

function createSendComponent(contractComponents: ExtendedContractComponents<SetupNetworkResult["components"]>) {
  const { Position } = contractComponents;
  const component = createExtendedComponent(world, {
    origin: Type.OptionalEntity,
    destination: Type.OptionalEntity,
    to: Type.OptionalEntity,
    units: Type.OptionalEntityArray,
    count: Type.OptionalNumberArray,
    sendType: Type.OptionalNumber,
  });

  const emptyComponent = {
    origin: undefined,
    destination: undefined,
    to: undefined,
    units: undefined,
    count: undefined,
    sendType: undefined,
  };

  const getUnitCount = (entity: Entity) => {
    const units = component.get()?.units;
    const count = component.get()?.count;

    if (!units || !count) return 0;

    const index = units.indexOf(entity);

    if (index === -1) return 0;

    if (index >= count.length) return 0;

    return count[index];
  };

  const reset = (playerEntity: Entity) => {
    const origin = components.Home.get(playerEntity)?.asteroid as Entity | undefined;

    component.set({
      origin,
      destination: undefined,
      units: undefined,
      count: undefined,
      to: undefined,
      sendType: undefined,
    });
  };

  const removeUnit = (entity: Entity) => {
    const units = component.get()?.units;
    const count = component.get()?.count;

    if (!units) return;

    const index = units.indexOf(entity);

    if (index === -1) return;

    units.splice(index, 1);
    count!.splice(index, 1);

    component.update({ units, count });
  };

  const setOrigin = (spaceRock: Entity | undefined) => {
    component.update({ origin: spaceRock });
  };

  const setDestination = (spaceRock: Entity | undefined) => {
    component.update({ destination: spaceRock });
  };

  const setUnitCount = (entity: Entity, count: number) => {
    let currentUnits = component.get()?.units;
    let currentCount = component.get()?.count;

    //initialize if null
    if (!currentUnits) {
      currentUnits = [entity];
      currentCount = [count];
      component.set({
        ...(component.get() || emptyComponent),
        units: currentUnits,
        count: currentCount,
      });
      return;
    }

    const index = currentUnits.indexOf(entity);

    //add new entity
    if (index === -1) {
      currentUnits.push(entity);
      currentCount!.push(count);
      component.update({ units: currentUnits, count: currentCount });
      return;
    }

    //update existing entity
    currentCount![index] = count;
    component.update({ units: currentUnits, count: currentCount });
  };

  const getDestinationCoord = () => {
    const destination = component.get()?.destination;

    const coord = Position.get(destination);

    return coord;
  };

  const getOriginCoord = () => {
    const origin = component.get()?.origin;

    const coord = Position.get(origin);

    return coord;
  };

  return {
    ...component,
    getUnitCount,
    setUnitCount,
    setOrigin,
    setDestination,
    getDestinationCoord,
    getOriginCoord,
    removeUnit,
    reset,
  };
}

export default createSendComponent;
