import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
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
import { createBuilding } from "../../common/factory/building";
import { createSelectionTile } from "../../common/factory/selectionTile";
import {
  HoverTile,
  SelectedAction,
  SelectedBuilding,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";

export const renderBuildingPlacementTool = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_buildingPlacement";
  const gameWorld = namespaceWorld(world, "game");

  const query = [
    Has(HoverTile),
    HasValue(SelectedAction, {
      value: Action.PlaceBuilding,
    }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    const objSpriteIndex = update.entity + "_sprite" + objIndexSuffix;
    const selectedBuilding = SelectedBuilding.get()?.value;

    // Avoid updating on optimistic overrides
    if (
      !selectedBuilding ||
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = HoverTile.get(world.entities[entityIndex]);
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
        buildingType: selectedBuilding,
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

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added"
    );
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    const objSpriteIndex = update.entity + "_sprite" + objIndexSuffix;

    scene.objectPool.remove(objGraphicsIndex);
    scene.objectPool.remove(objSpriteIndex);

    console.info(
      "[EXIT SYSTEM](renderBuildingPlacement) Building placement tool has been removed"
    );
  });
};
