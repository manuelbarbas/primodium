import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createSelectionTile } from "../../common/factory/selectionTile";
import { world } from "src/network/world";
import { SelectedTile } from "src/network/components/clientComponents";

export const renderSelectedTile = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");

  const query = [Has(SelectedTile)];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objGraphicsIndex = update.entity + "_selectionTile" + "_graphics";

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = SelectedTile.get(world.entities[entityIndex]);

    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const selectionTileGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    selectionTileGraphicsEmbodiedEntity.setComponent(
      createSelectionTile({
        id: objGraphicsIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileWidth,
        tileHeight,
      })
    );
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);
    console.info(
      "[ENTER SYSTEM](renderSelectionTile) Selection tile has been added"
    );
  });

  defineUpdateSystem(gameWorld, query, render);

  defineExitSystem(gameWorld, query, (update) => {
    const objGraphicsIndex = update.entity + "_selectionTile" + "_graphics";
    scene.objectPool.remove(objGraphicsIndex);

    console.info(
      "[EXIT SYSTEM](renderSelectionTile) Selection tile has been removed"
    );
  });
};
