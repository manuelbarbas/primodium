import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { HomeAsteroid, Send } from "src/network/components/clientComponents";

export const setupHomeAsteroid = (player: EntityID) => {
  defineComponentSystem(world, Position, ({ entity, value }) => {
    if (world.entities[entity] !== player) return;
    const asteroid = value[0]?.parent;
    if (!asteroid) return;
    HomeAsteroid.set({ value: asteroid });

    Send.setOrigin(asteroid);
  });
};
