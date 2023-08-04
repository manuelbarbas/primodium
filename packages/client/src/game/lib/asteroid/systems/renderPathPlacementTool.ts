import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, HasValue } from "@latticexyz/recs";
import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "src/network/systems/System";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import { createPath } from "../../common/factory/path";
import { createSelectionTile } from "../../common/factory/selectionTile";
import {
  HoverTile,
  SelectedAction,
  StartSelectedPath,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";

export const renderPathPlacementTool = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_pathPlacement";

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

  defineEnterSystem(
    world,
    query,
    (update) => {
      render(update);

      console.info(
        "[ENTER SYSTEM](renderPathPlacementTool) Path placement tool has been added"
      );
    },
    { namespace: "game" }
  );

  defineUpdateSystem(world, query, render, { namespace: "game" });

  defineExitSystem(
    world,
    query,
    (update) => {
      const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
      scene.objectPool.remove(objGraphicsIndex);
      StartSelectedPath.remove();

      console.info(
        "[EXIT SYSTEM](renderPathPlacementTool) Path placement tool has been removed"
      );
    },
    { namespace: "game" }
  );
};
