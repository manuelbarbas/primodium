import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { ActiveAsteroid, Send } from "src/network/components/clientComponents";

export const setupActiveAsteroid = (player: EntityID) => {
  // todo: move this to an initialize function @NAB5
  // const asteroid = Position.get(player)?.parent;
  // if (asteroid) ActiveAsteroid.set({ value: asteroid });

  defineComponentSystem(world, Position, ({ entity, value }) => {
    if (world.entities[entity] !== player) return;
    const asteroid = value[0]?.parent;
    if (!asteroid) return;
    ActiveAsteroid.set({ value: asteroid });

    // temp so we can test without the set origin ui
    const position = Position.get(asteroid);
    Send.update({ originX: position?.x, originY: position?.y });
  });
};
