import {
  ComponentUpdate,
  Has,
  NotValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Network } from "src/network/layer";
import { Scene } from "src/engine/types";
import { BlockType } from "src/util/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { createBuilding } from "../factory/building";
import { createSelectionTile } from "../factory/selectionTile";
import * as components from "src/game/api/components";

export const renderBuildingPlacementTool = (scene: Scene, network: Network) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_buildingPlacement";

  const query = [
    Has(offChainComponents.HoverTile),
    Has(offChainComponents.SelectedBuilding),
    NotValue(offChainComponents.SelectedBuilding, {
      value: BlockType.SelectAttack,
    }),
    NotValue(offChainComponents.SelectedBuilding, {
      value: BlockType.DemolishPath,
    }),
    NotValue(offChainComponents.SelectedBuilding, {
      value: BlockType.DemolishBuilding,
    }),
    NotValue(offChainComponents.SelectedBuilding, {
      value: BlockType.Conveyor,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    const objSpriteIndex = update.entity + "_sprite" + objIndexSuffix;
    const selectedBuilding = components.selectedBuilding(network).get();

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = update.value[0] as Coord;

    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const hoverTileGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    const hoverTileSpriteEmbodiedEntity = scene.objectPool.get(
      objSpriteIndex,
      "Sprite"
    );

    hoverTileSpriteEmbodiedEntity.setComponent(
      createBuilding({
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tile: selectedBuilding!,
      })
    );

    hoverTileGraphicsEmbodiedEntity.setComponent(
      createSelectionTile({
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileHeight,
        tileWidth,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    const objSpriteIndex = update.entity + "_sprite" + objIndexSuffix;

    scene.objectPool.remove(objGraphicsIndex);
    scene.objectPool.remove(objSpriteIndex);

    console.info(
      "[EXIT SYSTEM](renderBuildingPlacement) Building placement tool has been removed"
    );
  });
};
