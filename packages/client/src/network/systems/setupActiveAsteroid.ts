import { Entity, defineComponentSystem } from "@latticexyz/recs";
import { ActiveAsteroid } from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { components } from "../components";

export const setupActiveAsteroid = (player: Entity) => {
  defineComponentSystem(world, components.Home, ({ entity, value }) => {
    if (entity != player) return;
    const asteroid = value[0]?.asteroid as Entity | undefined;
    if (!asteroid) return;
    ActiveAsteroid.set({ value: asteroid });

    // temp so we can test without the set origin ui
    components.Send.setOrigin(asteroid);
  });
};
