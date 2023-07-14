import { defineComponentSystem, setComponent } from "@latticexyz/recs";
import { decodeCoordEntity } from "../util/encode";
import { Network } from "./layer";

export function syncPositionComponent(network: Network) {
  const {
    world,
    components: { Position, OwnedBy },
  } = network;

  // set positions for building tiles only
  defineComponentSystem(world, OwnedBy, ({ entity }) => {
    // Avoid updating on optimistic overrides
    if (typeof entity !== "number" || entity >= world.entities.length) {
      return;
    }
    const coord = decodeCoordEntity(world.entities[entity]);
    setComponent(Position, entity, coord);
  });
}
