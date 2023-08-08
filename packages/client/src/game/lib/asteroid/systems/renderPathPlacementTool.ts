import { addCoords, tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import {
  HoverTile,
  SelectedAction,
  StartSelectedPath,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { ObjectPosition } from "../../common/object-components/common";
import { ManhattanPath, Square } from "../../common/object-components/graphics";

export const renderPathPlacementTool = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_pathPlacement";
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(HoverTile),
    HasValue(SelectedAction, {
      value: Action.Conveyor,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const startPathCoord = StartSelectedPath.get();
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = HoverTile.get(world.entities[entityIndex]);

    if (!tileCoord) return;

    scene.objectPool.remove(objGraphicsIndex);

    const pixelHoverCoord = tileCoordToPixelCoord(
      tileCoord,
      tileWidth,
      tileHeight
    );

    const pathEndPos = {
      x: Math.floor(pixelHoverCoord.x / tileWidth) * tileWidth,
      y: -Math.floor(pixelHoverCoord.y / tileWidth) * tileHeight,
    };

    const pathGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    if (!startPathCoord) {
      pathGraphicsEmbodiedEntity.setComponents([
        ObjectPosition(pathEndPos),
        Square(tileWidth, tileHeight, {
          color: 0xff00ff,
          alpha: 0.2,
        }),
      ]);
      return;
    }

    const pixelStartCoord = tileCoordToPixelCoord(
      startPathCoord,
      tileWidth,
      tileHeight
    );

    const pathStartPos = {
      x: Math.floor(pixelStartCoord.x / tileWidth) * tileWidth,
      y: -Math.floor(pixelStartCoord.y / tileWidth) * tileHeight,
    };

    const offset = {
      x: tileWidth / 2,
      y: tileHeight / 2,
    };

    pathGraphicsEmbodiedEntity.setComponents([
      ObjectPosition(pathEndPos),
      Square(tileWidth, tileHeight, {
        color: 0xff00ff,
        alpha: 0.2,
      }),
      ManhattanPath(addCoords(pathEndPos, offset), {
        start: addCoords(pathStartPos, offset),
        dashed: true,
        color: 0xff00ff,
      }),
      Square(tileWidth, tileHeight, {
        position: pathStartPos,
        color: 0xff00ff,
        alpha: 0.2,
      }),
    ]);

    // pathGraphicsEmbodiedEntity.setComponent(
    //   createPath({
    //     id: objGraphicsIndex,
    //     startX: pixelStartCoord.x + tileWidth / 2,
    //     startY: -pixelStartCoord.y + tileHeight / 2,
    //     endX: pixelHoverCoord.x + tileWidth / 2,
    //     endY: -pixelHoverCoord.y + tileHeight / 2,
    //     color: 0xff00ff,
    //     speed: 50,
    //     lineWidth: 1.5,
    //     highlight: true,
    //     dashed: true,
    //   })
    // );
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderPathPlacementTool) Path placement tool has been added"
    );
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);
    StartSelectedPath.remove();

    console.info(
      "[EXIT SYSTEM](renderPathPlacementTool) Path placement tool has been removed"
    );
  });
};
