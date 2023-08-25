import { EntityID, Metadata, World, Type } from "@latticexyz/recs";

import newComponent, { Options } from "./Component";

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
    },
    options
  );

  const getUnitCount = (entity: EntityID) => {
    const units = component.get()?.units;
    const count = component.get()?.count;

    if (!units || !count) return 0;

    const index = units.indexOf(entity);

    if (index === -1) return 0;

    if (index >= count.length) return 0;

    return count[index];
  };

  const removeUnit = (entity: EntityID) => {
    let units = component.get()?.units;
    let count = component.get()?.count;

    if (!units) return;

    const index = units.indexOf(entity);

    if (index === -1) return;

    units.splice(index, 1);
    count!.splice(index, 1);

    component.update({ units, count });
  };

  const setUnitCount = (entity: EntityID, count: number) => {
    let currentUnits = component.get()?.units;
    let currentCount = component.get()?.count;

    //initialize if null
    if (!currentUnits) {
      currentUnits = [entity];
      currentCount = [count];
      component.update({ units: currentUnits, count: currentCount });
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

  return { ...component, getUnitCount, setUnitCount, removeUnit };
}

export default newSendComponent;
