import {
  defineComponentSystem,
  hasComponent,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Network } from "./layer";
import { decodeCoordEntity } from "../util/encode";

export function syncPositionComponent(network: Network) {
  const {
    world,
    components: { Tile, Position },
  } = network;

  defineComponentSystem(world, Tile, (update) => {
    // Avoid updating on optimistic overrides
    if (
      typeof update.entity !== "number" ||
      update.entity >= world.entities.length
    ) {
      return;
    }
    const coord = decodeCoordEntity(world.entities[update.entity]);
    if (!hasComponent(Tile, update.entity)) {
      removeComponent(Position, update.entity);
      return;
    }
    setComponent(Position, update.entity, coord);
  });
}
