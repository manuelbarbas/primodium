import {
  defineComponentSystem,
  hasComponent,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { decodeCoordEntity } from "../util/encode";
import { Network } from "./layer";

export function syncPositionComponent(network: Network) {
  const {
    world,
    components: { BuildingType, Position },
  } = network;

  defineComponentSystem(world, BuildingType, (update) => {
    // Avoid updating on optimistic overrides
    if (
      typeof update.entity !== "number" ||
      update.entity >= world.entities.length
    ) {
      return;
    }
    const coord = decodeCoordEntity(world.entities[update.entity]);
    if (!hasComponent(BuildingType, update.entity)) {
      removeComponent(Position, update.entity);
      return;
    }
    setComponent(Position, update.entity, coord);
  });
}
