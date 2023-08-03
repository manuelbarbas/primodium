import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import { createSelectionTile } from "../../common/factory/selectionTile";
import {
  HoverTile,
  SelectedAction,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";

export const renderDemolishBuildingTool = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_demolishBuilding";

  const query = [
    Has(HoverTile),
    HasValue(SelectedAction, { value: Action.DemolishBuilding }),
  ];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
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

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const demolishTileGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    demolishTileGraphicsEmbodiedEntity.setComponent(
      createSelectionTile({
        id: objGraphicsIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileHeight,
        tileWidth,
        color: 0xff0000,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderDemolishBuilding) Demolish Building tool has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);

    console.info(
      "[EXIT SYSTEM](renderDemolishBuilding) Demolish building tool has been removed"
    );
  });
};
