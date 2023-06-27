import { defineComponentSystem } from "@latticexyz/recs";

import { Network } from "../../../network/layer";
import { Scene } from "../../../engine/types";

export const createHoverTileSystem = (network: Network, _scene: Scene) => {
  const { world, offChainComponents } = network;

  defineComponentSystem(
    world,
    offChainComponents.HoverTile,
    (update) => {
      const entityIndex = update.entity;
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      const tilePos = update.value[0];

      if (!tilePos) return;
    },
    { runOnInit: true }
  );
};
