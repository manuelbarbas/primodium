import { defineComponentSystem, hasComponent } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { runInAction } from "mobx";

import { Network } from "../../../network/layer";
import { Scene } from "../../../engine/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { createSelectedTile } from "../factory/selectedTile";

export const createSelectedTileSystem = (network: Network, scene: Scene) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;

  defineComponentSystem(
    world,
    offChainComponents.SelectedTile,
    (update) => {
      const entityIndex = update.entity;
      const objIndex = update.entity + "_selectedTile";
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      if (!hasComponent(offChainComponents.SelectedTile, entityIndex)) {
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

      const selectedTileComponent = createSelectedTile(
        pixelTileCoord.x,
        -pixelTileCoord.y,
        tileWidth,
        tileHeight
      );

      selectedTileEmbodiedEntity.setComponent(selectedTileComponent);
    },
    { runOnInit: true }
  );
};
