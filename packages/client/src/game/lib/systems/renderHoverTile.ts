import {
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import {
  EntityIndex,
  Has,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  setComponent,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Network } from "src/network/layer";
import { hoverTile } from "../../api/components";
import { createHoverTile } from "../factory/createHoverTile";

const objGraphicsIndex = (entity: EntityIndex) =>
  `${entity}_hoverTile_graphics`;

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

  const render = ({ entity }: { entity: EntityIndex }) => {
    // Avoid updating on optimistic overrides
    if (typeof entity !== "number" || entity >= world.entities.length) {
      return;
    }

    const tileCoord = hoverTile(network).get();

    if (!tileCoord) return;

    const pixelCoord = tileCoordToPixelCoord(tileCoord, tileWidth, tileHeight);

    const hoverRenderObject = scene.objectPool.get(
      objGraphicsIndex(entity),
      "Graphics"
    );

    hoverRenderObject.setComponent(
      createHoverTile({
        id: objGraphicsIndex(entity),
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
    scene.objectPool.remove(objGraphicsIndex(update.entity));

    console.info(
      "[EXIT SYSTEM](renderSelectionTile) Hover tile has been removed"
    );
  });
};
