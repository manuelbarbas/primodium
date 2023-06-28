import {
  EntityID,
  defineComponentSystem,
  hasComponent,
} from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Network } from "../../../network/layer";
import { Scene } from "../../../engine/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { createHoverTile } from "../factory/hoverTile";
import { getSelectedBuildingComponent } from "src/game/api/components";

export const createHoverTileSystem = (network: Network, scene: Scene) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;

  defineComponentSystem(
    world,
    offChainComponents.HoverTile,
    (update) => {
      const entityIndex = update.entity;
      const objIndex = update.entity + "_hoverTile";
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      if (
        !hasComponent(offChainComponents.HoverTile, entityIndex) ||
        !hasComponent(offChainComponents.SelectedBuilding, entityIndex)
      ) {
        if (scene.objectPool.objects.has(objIndex)) {
          scene.objectPool.remove(objIndex);
        }
        return;
      }

      const tileCoord = update.value[0] as Coord;

      if (!tileCoord) return;

      const pixelTileCoord = tileCoordToPixelCoord(
        tileCoord,
        tileWidth,
        tileHeight
      );

      const selectedTileEmbodiedEntity = scene.objectPool.get(
        objIndex,
        "Graphics"
      );

      const selectedBuilding = getSelectedBuildingComponent(network);

      const selectedHoverComponent = createHoverTile(
        pixelTileCoord.x,
        -pixelTileCoord.y,
        tileWidth,
        tileHeight,
        selectedBuilding as EntityID
      );
      selectedTileEmbodiedEntity.setComponent(selectedHoverComponent);
    },
    { runOnInit: true }
  );
};
