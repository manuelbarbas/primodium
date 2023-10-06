import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { components } from "../components";

export const setupActiveAsteroid = (player: Entity) => {
  defineComponentSystem(world, components.Position, ({ entity, value }) => {
    const asteroid = value[0]?.parent;
    if (!asteroid) return;
    ActiveAsteroid.set({ value: asteroid as Entity });

    // temp so we can test without the set origin ui
    const position = components.Position.get(asteroid as Entity);
    // Send.setOrigin(position);
  });
};
