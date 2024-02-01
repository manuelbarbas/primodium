import { Entity, Type } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { world } from "src/network/world";
import { createExtendedComponent } from "./ExtendedComponent";

function createSendComponent() {
  const component = createExtendedComponent(world, {
    originX: Type.OptionalNumber,
    originY: Type.OptionalNumber,
    originFleet: Type.OptionalEntity,
    destination: Type.OptionalEntity,
  });

  const emptyComponent = {
    destination: undefined,
    originX: undefined,
    originY: undefined,
    originFleet: undefined,
  };

  const reset = () => {
    component.set(emptyComponent);
  };

  const setOrigin = (fleet: Entity, coord: Coord) => {
    if (!component.get()) reset();
    component.update({ originFleet: fleet, originX: coord.x, originY: coord.y });
  };

  const setDestination = (spaceRock: Entity | undefined) => {
    if (!component.get()) reset();
    component.update({ destination: spaceRock });
  };

  return {
    ...component,
    setOrigin,
    setDestination,
    reset,
  };
}

export default createSendComponent;
