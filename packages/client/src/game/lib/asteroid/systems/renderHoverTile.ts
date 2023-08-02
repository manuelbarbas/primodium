import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  EntityIndex,
  Has,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { createHoverTile } from "../factory/createHoverTile";
import { HoverTile } from "src/network/components/clientComponents";
import { world } from "src/network/world";

const objGraphicsIndex = (entity: EntityIndex) =>
  `${entity}_hoverTile_graphics`;

export const renderHoverTile = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;

  const query = [Has(HoverTile)];

  const render = ({ entity }: { entity: EntityIndex }) => {
    // Avoid updating on optimistic overrides
    if (typeof entity !== "number" || entity >= world.entities.length) {
      return;
    }

    const tileCoord = HoverTile.get();

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
