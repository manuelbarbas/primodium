import { Entity, Type } from "@latticexyz/recs";
import { world } from "src/network/world";
import { createExtendedComponent } from "./ExtendedComponent";

function createSendComponent() {
  const component = createExtendedComponent(world, {
    origin: Type.OptionalEntity,
    destination: Type.OptionalEntity,
    fleetEntity: Type.OptionalEntity,
  });

  const emptyComponent = {
    origin: undefined,
    destination: undefined,
    fleetEntity: undefined,
  };

  const reset = () => {
    component.set(emptyComponent);
  };

  const setOrigin = (spaceRock: Entity | undefined) => {
    if (!component.get()) reset();
    component.update({ origin: spaceRock });
  };

  const setDestination = (spaceRock: Entity | undefined) => {
    if (!component.get()) reset();
    component.update({ destination: spaceRock });
  };

  const setFleetEntity = (fleetEntity: Entity | undefined) => {
    if (!component.get()) reset();
    component.update({ fleetEntity });
  };

  return {
    ...component,
    setOrigin,
    setDestination,
    setFleetEntity,
    reset,
  };
}

export default createSendComponent;
