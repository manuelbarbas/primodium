import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, HasValue } from "@latticexyz/recs";
import { defineEnterSystem, defineExitSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { TransactionQueueType } from "src/util/constants";
import { world } from "src/network/world";
import { components } from "src/network/components";
import { ObjectPosition, OnExitSystem } from "../../common/object-components/common";
import { ObjectText } from "../../common/object-components/text";

export const renderQueuedBuildings = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_buildingQueued";

  const query = [
    Has(components.TransactionQueue),
    HasValue(components.TransactionQueue, {
      type: TransactionQueueType.Build,
    }),
  ];

  const render = ({ entity }: ComponentUpdate) => {
    const objIndex = entity + objIndexSuffix;
    const metadata = components.TransactionQueue.getMetadata<TransactionQueueType.Build>(entity);

    if (!metadata) return;

    scene.objectPool.remove(objIndex);
    const textRenderObject = scene.objectPool.get(objIndex, "Text");

    const pixelCoord = tileCoordToPixelCoord(metadata.coord, tileWidth, tileHeight);

    textRenderObject.setComponents([
      ObjectPosition({
        x: pixelCoord.x + tileWidth / 2,
        y: -pixelCoord.y + tileHeight / 2,
      }),
      //update text when item on queued is popped
      OnExitSystem(query, () => {
        textRenderObject.setComponent(
          ObjectText(components.TransactionQueue.getIndex(entity).toString(), {
            id: "building-queued-text",
            align: "center",
          })
        );
      }),
      ObjectText(components.TransactionQueue.getIndex(entity).toString(), {
        id: "building-queued-text",
        align: "center",
      }),
    ]);
  };

  defineEnterSystem(gameWorld, query, (update) => {
    render(update);

    console.info("[ENTER SYSTEM](transaction queued)");
  });

  defineExitSystem(gameWorld, query, (update) => {
    const objIndex = update.entity + objIndexSuffix;

    scene.objectPool.remove(objIndex);

    console.info("[EXIT SYSTEM](transaction completed)");
  });
};
