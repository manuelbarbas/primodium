import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Network } from "src/network/layer";
import { Scene } from "src/engine/types";
import { BlockType } from "src/util/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { createSelectionTile } from "../factory/selectionTile";
import * as components from "src/game/api/components";
import { createPath } from "../factory/path";

export const renderPathPlacementTool = (scene: Scene, network: Network) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_pathPlacement";

  const query = [
    Has(offChainComponents.HoverTile),
    HasValue(offChainComponents.SelectedBuilding, {
      value: BlockType.Conveyor,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const startPathCoord = components.startSelectedPath(network).get();
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = update.value[0] as Coord;

    if (!tileCoord) return;

    const pixelHoverCoord = tileCoordToPixelCoord(
      tileCoord,
      tileWidth,
      tileHeight
    );

    const pathGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    if (!startPathCoord) {
      pathGraphicsEmbodiedEntity.setComponent(
        createSelectionTile({
          id: objGraphicsIndex,
          x: pixelHoverCoord.x,
          y: -pixelHoverCoord.y,
          tileHeight,
          tileWidth,
          color: 0xff000ff,
        })
      );

      return;
    }

    const pixelStartCoord = tileCoordToPixelCoord(
      startPathCoord,
      tileWidth,
      tileHeight
    );

    pathGraphicsEmbodiedEntity.setComponent(
      createPath({
        id: objGraphicsIndex,
        startX: pixelStartCoord.x + tileWidth / 2,
        startY: -pixelStartCoord.y + tileHeight / 2,
        endX: pixelHoverCoord.x + tileWidth / 2,
        endY: -pixelHoverCoord.y + tileHeight / 2,
        color: 0xff00ff,
        speed: 50,
        lineWidth: 1.5,
        highlight: true,
        dashed: true,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderPathPlacementTool) Path placement tool has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);
    components.startSelectedPath(network).remove();

    console.info(
      "[EXIT SYSTEM](renderPathPlacementTool) Path placement tool has been removed"
    );
  });
};
