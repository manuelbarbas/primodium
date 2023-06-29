import { defineComponentSystem } from "@latticexyz/recs";

import { Network } from "../../../network/layer";
import * as components from "../../api/components";

export const createSelectedBuildingSystem = (network: Network) => {
  const { world, offChainComponents } = network;

  defineComponentSystem(
    world,
    offChainComponents.SelectedBuilding,
    (update) => {
      const entityIndex = update.entity;

      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      console.log("here", components.selectedBuilding(network).get());

      //remove selected path if selected building is changed
      components.startSelectedPath(network).remove();
      components.hoverTile(network).remove();
    },
    { runOnInit: true }
  );
};
