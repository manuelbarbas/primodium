import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { EntityIndex, Has } from "@latticexyz/recs";
import {
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "src/network/systems/System";
import { Scene } from "engine/types";
import { createHoverTile } from "../../common/factory/createHoverTile";
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

  defineEnterSystem(
    world,
    query,
    (update) => {
      render(update);
      console.info("[ENTER SYSTEM](renderHoverTile) Hover tile has been added");
    },
    { namespace: "game" }
  );

  defineUpdateSystem(world, query, render, {
    namespace: "game",
  });

  defineExitSystem(
    world,
    query,
    (update) => {
      scene.objectPool.remove(objGraphicsIndex(update.entity));

      console.info(
        "[EXIT SYSTEM](renderHoverTile) Hover tile has been removed"
      );
    },
    { namespace: "game" }
  );
};
