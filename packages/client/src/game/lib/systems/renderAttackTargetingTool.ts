import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import { Action } from "src/util/constants";
import { createAttackPath } from "../factory/attackPath";
import { createSelectionTile } from "../factory/selectionTile";
import {
  HoverTile,
  SelectedAction,
  SelectedAttack,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";

export const renderAttackTargetingTool = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_attackTargeting";

  const query = [
    Has(HoverTile),
    HasValue(SelectedAction, { value: Action.SelectAttack }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const attackSelection = SelectedAttack.getCoords();
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    //we don't need to do anything if both are set
    if (attackSelection.origin && attackSelection.target) return;

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

    if (!attackSelection.origin) {
      pathGraphicsEmbodiedEntity.setComponent(
        createSelectionTile({
          id: objGraphicsIndex,
          x: pixelHoverCoord.x,
          y: -pixelHoverCoord.y,
          tileHeight,
          tileWidth,
          color: 0xff00000,
        })
      );

      return;
    }

    const pixelStartCoord = tileCoordToPixelCoord(
      attackSelection.origin,
      tileWidth,
      tileHeight
    );

    pathGraphicsEmbodiedEntity.setComponent(
      createAttackPath({
        id: objGraphicsIndex,
        startX: pixelStartCoord.x,
        startY: -pixelStartCoord.y,
        endX: pixelHoverCoord.x,
        endY: -pixelHoverCoord.y,
        tileHeight,
        tileWidth,
        triangleCount: 5,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](rrenderAttackTargetingTool) Attack Targeting tool has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);
    SelectedAttack.remove();

    console.info(
      "[EXIT SYSTEM](renderAttackTargetingTool) Attack targeting tool has been removed"
    );
  });
};
