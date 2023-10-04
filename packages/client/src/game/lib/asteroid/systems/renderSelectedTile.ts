import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has } from "@latticexyz/recs";
import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import { SelectedTile } from "src/network/components/clientComponents";
import { ObjectPosition } from "../../common/object-components/common";
import { Square } from "../../common/object-components/graphics";
import { DepthLayers } from "@game/constants";

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

    scene.objectPool.remove(objGraphicsIndex);

    const selectionTileGraphicsEmbodiedEntity = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    selectionTileGraphicsEmbodiedEntity.setComponents([
      ObjectPosition(
        {
          x: Math.floor(pixelCoord.x / tileWidth) * tileWidth,
          y: -Math.floor(pixelCoord.y / tileWidth) * tileHeight,
        },
        DepthLayers.Path
      ),
      Square(tileWidth, tileHeight, {
        borderThickness: 1,
        color: 0x00ffff,
        alpha: 0.2,
      }),
    ]);
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
