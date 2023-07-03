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
import { createAttackPath } from "../factory/attackPath";

export const renderAttackTargetingTool = (scene: Scene, network: Network) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_attackTargeting";

  const query = [
    Has(offChainComponents.HoverTile),
    HasValue(offChainComponents.SelectedBuilding, {
      value: BlockType.SelectAttack,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const attackSelection = components.selectedAttack(network).get();
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
    components.selectedAttack(network).remove();

    console.info(
      "[EXIT SYSTEM](renderAttackTargetingTool) Attack targeting tool has been removed"
    );
  });
};
