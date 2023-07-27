import { defineComponentSystem } from "@latticexyz/recs";
import { decodeCoordEntity } from "../util/encode";
import { world } from "./world";
import { OwnedBy } from "./components/chainComponents";
import { Position } from "./components/clientComponents";

export function syncPositionComponent() {
  // set positions for building tiles only
  defineComponentSystem(world, OwnedBy, ({ entity }) => {
    // Avoid updating on optimistic overrides
    if (typeof entity !== "number" || entity >= world.entities.length) {
      return;
    }
    const coord = decodeCoordEntity(world.entities[entity]);
    Position.set(coord, world.entities[entity]);
  });

  defineComponentSystem(world, Position, (update) => {
    console.log(
      "updating position of ",
      update.entity,
      `to: `,
      update.value[0]
    );
  });
}
