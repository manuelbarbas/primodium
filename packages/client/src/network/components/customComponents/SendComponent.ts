import { EntityID, Metadata, World, Type } from "@latticexyz/recs";

import newComponent, { Options } from "./Component";
import { Position } from "../chainComponents";
import { HomeAsteroid } from "../clientComponents";

function newSendComponent<Overridable extends boolean, M extends Metadata>(
  world: World,
  options?: Options<Overridable, M>
) {
  const component = newComponent(
    world,
    {
      origin: Type.OptionalEntity,
      destination: Type.OptionalEntity,
      to: Type.OptionalEntity,
      units: Type.OptionalEntityArray,
      count: Type.OptionalNumberArray,
      sendType: Type.OptionalNumber,
    },
    options
  );
  const emptyComponent = {
    origin: undefined,
    destination: undefined,
    to: undefined,
    units: undefined,
    count: undefined,
    sendType: undefined,
  };

  const getUnitCount = (entity: EntityID) => {
    const units = component.get()?.units;
    const count = component.get()?.count;

    if (!units || !count) return 0;

    const index = units.indexOf(entity);

    if (index === -1) return 0;

    if (index >= count.length) return 0;

    return count[index];
  };

  const reset = () => {
    const activeAsteroid = HomeAsteroid.get()?.value;

    component.set({
      origin: activeAsteroid,
      destination: undefined,
      units: undefined,
      count: undefined,
      to: undefined,
      sendType: undefined,
    });
  };

  const removeUnit = (entity: EntityID) => {
    const units = component.get()?.units;
    const count = component.get()?.count;

    if (!units) return;

    const index = units.indexOf(entity);

    if (index === -1) return;

    units.splice(index, 1);
    count!.splice(index, 1);

    component.update({ units, count });
  };

  const setOrigin = (spaceRock: EntityID | undefined) => {
    component.update({ origin: spaceRock });
  };

  const setDestination = (spaceRock: EntityID | undefined) => {
    component.update({ destination: spaceRock });
  };

  const setUnitCount = (entity: EntityID, count: number) => {
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

export default newSendComponent;
