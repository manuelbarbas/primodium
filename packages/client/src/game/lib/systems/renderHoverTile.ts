import {
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  Has,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  setComponent,
} from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import { Network } from "src/network/layer";
import { hoverTile } from "../../api/components";
import { createHoverTile } from "../factory/createHoverTile";

export const renderHoverTile = (scene: Scene, network: Network) => {
  const { world, offChainComponents, singletonIndex } = network;
  const { tileWidth, tileHeight } = scene.tilemap;

  const query = [Has(offChainComponents.HoverTile)];

  scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const mouseCoord = { x, y: -y };
    setComponent(offChainComponents.HoverTile, singletonIndex, {
      ...mouseCoord,
    });
    hoverTile(network).set(mouseCoord);
  });

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objGraphicsIndex = update.entity + "_hoverTile" + "_graphics";

    // Avoid updating on optimistic overrides
    if (
      typeof entityIndex !== "number" ||
      entityIndex >= world.entities.length
    ) {
      return;
    }

    const tileCoord = hoverTile(network).get();

    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const hoverRenderObject = scene.objectPool.get(
      objGraphicsIndex,
      "Graphics"
    );

    hoverRenderObject.setComponent(
      createHoverTile({
        id: objGraphicsIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tileWidth,
        tileHeight,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);
    console.info(
      "[ENTER SYSTEM](renderSelectionTile) Hover tile has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_selectionTile" + "_graphics";
    scene.objectPool.remove(objGraphicsIndex);

    console.info(
      "[EXIT SYSTEM](renderSelectionTile) Hover tile has been removed"
    );
  });
};
