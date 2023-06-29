import { defineComponentSystem, hasComponent } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Network } from "../../../network/layer";
import { Scene } from "../../../engine/types";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import * as components from "src/game/api/components";
import { BlockType } from "src/util/constants";
import { createSelectionTile } from "../factory/selectionTile";
import { createSelectionPath } from "../factory/selectionPath";
import { createBuilding } from "../factory/building";

export const createHoverTileSystem = (network: Network, scene: Scene) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;

  defineComponentSystem(
    world,
    offChainComponents.HoverTile,
    (update) => {
      const entityIndex = update.entity;
      const objGraphicsIndex = update.entity + "_hoverTile" + "graphics";
      const objSpriteIndex = update.entity + "_hoverTile" + "sprite";
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
        //remove graphics objects
        if (scene.objectPool.objects.has(objGraphicsIndex)) {
          scene.objectPool.remove(objGraphicsIndex);
        }

        //remove sprite objects
        if (scene.objectPool.objects.has(objSpriteIndex)) {
          scene.objectPool.remove(objSpriteIndex);
        }

        return;
      }

      const tileCoord = update.value[0] as Coord;

      if (!tileCoord) return;

      const pixelCoord = tileCoordToPixelCoord(
        tileCoord,
        tileWidth,
        tileHeight
      );

      const hoverTileGraphicsEmbodiedEntity = scene.objectPool.get(
        objGraphicsIndex,
        "Graphics"
      );

      const selectedBuilding = components.selectedBuilding(network).get();

      switch (selectedBuilding) {
        case undefined:
          break;
        case BlockType.Conveyor:
          const startCoord = components.startSelectedPath(network).get();

          //show magenta selection tile when no start has been set
          if (!startCoord) {
            hoverTileGraphicsEmbodiedEntity.setComponent(
              createSelectionTile(
                pixelCoord.x,
                -pixelCoord.y,
                tileWidth,
                tileHeight,
                0xff00ff
              )
            );
            break;
          }

          const pixelStartCoord = tileCoordToPixelCoord(
            startCoord,
            tileWidth,
            tileHeight
          );

          hoverTileGraphicsEmbodiedEntity.setComponent(
            createSelectionPath(
              pixelStartCoord.x,
              -pixelStartCoord.y,
              pixelCoord.x,
              -pixelCoord.y,
              tileWidth,
              tileHeight,
              50
            )
          );
          break;
        case BlockType.DemolishPath:
          hoverTileGraphicsEmbodiedEntity.setComponent(
            createSelectionTile(
              pixelCoord.x,
              -pixelCoord.y,
              tileWidth,
              tileHeight,
              0xffa500
            )
          );
          break;
        case BlockType.DemolishBuilding:
          hoverTileGraphicsEmbodiedEntity.setComponent(
            createSelectionTile(
              pixelCoord.x,
              -pixelCoord.y,
              tileWidth,
              tileHeight,
              0xff0000
            )
          );
          break;
        default:
          const hoverTileSpriteEmbodiedEntity = scene.objectPool.get(
            objSpriteIndex,
            "Sprite"
          );
          hoverTileSpriteEmbodiedEntity.setComponent(
            createBuilding(pixelCoord.x, -pixelCoord.y, selectedBuilding)
          );
          hoverTileGraphicsEmbodiedEntity.setComponent(
            createSelectionTile(
              pixelCoord.x,
              -pixelCoord.y,
              tileWidth,
              tileHeight
            )
          );
      }
    },
    { runOnInit: true }
  );
};
