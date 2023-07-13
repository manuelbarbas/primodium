import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  NotValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  getComponentValue,
} from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import * as components from "src/game/api/components";
import { Network } from "src/network/layer";
import { Action } from "src/util/constants";
import { createBuilding } from "../factory/building";
import { createSelectionTile } from "../factory/selectionTile";

export const renderBuildingPlacementTool = (scene: Scene, network: Network) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_buildingPlacement";

  const query = [
    Has(offChainComponents.HoverTile),
    Has(offChainComponents.SelectedAction),
    NotValue(offChainComponents.SelectedAction, {
      value: Action.SelectAttack,
    }),
    NotValue(offChainComponents.SelectedAction, {
      value: Action.DemolishPath,
    }),
    NotValue(offChainComponents.SelectedAction, {
      value: Action.DemolishBuilding,
    }),
    NotValue(offChainComponents.SelectedAction, {
      value: Action.Conveyor,
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

    const tileCoord = getComponentValue(
      offChainComponents.HoverTile,
      entityIndex
    );

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
        buildingType: selectedBuilding!,
      })
    );

    hoverTileGraphicsEmbodiedEntity.setComponent(
      createSelectionTile({
        id: objGraphicsIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileHeight,
        tileWidth,
        alpha: 0,
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
