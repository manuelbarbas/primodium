import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { ComponentUpdate, Has, HasValue } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { defineEnterSystem, defineExitSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { TransactionQueueType } from "src/util/constants";
import { world } from "src/network/world";
import { components } from "src/network/components";
import { ObjectPosition, OnExitSystem } from "../../common/object-components/common";
import { ObjectText } from "../../common/object-components/text";
import { SetupResult } from "src/network/types";

export const renderQueuedBuildings = (scene: Scene, mud: SetupResult) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const gameWorld = namespaceWorld(world, "game");
  const objIndexSuffix = "_buildingQueued";
  // const playerEntity = mud.network.playerEntity;

  const query = [
    Has(components.TransactionQueue),
    HasValue(components.TransactionQueue, {
      type: TransactionQueueType.Build,
    }),
  ];

  const render = ({ entity }: ComponentUpdate) => {
    const objIndex = entity + objIndexSuffix;
    const rawValue = components.TransactionQueue.get(entity)?.value;

    if (!rawValue) return;

    scene.objectPool.remove(objIndex);
    const textRenderObject = scene.objectPool.get(objIndex, "Text");

    const coord = JSON.parse(rawValue) as Coord;
    const pixelCoord = tileCoordToPixelCoord(coord, tileWidth, tileHeight);

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

    console.info("[ENTER SYSTEM](renderBuildingPlacement) Building placement tool has been added");
  });

  defineExitSystem(gameWorld, query, (update) => {
    const objIndex = update.entity + objIndexSuffix;

    scene.objectPool.remove(objIndex);

    console.info("[EXIT SYSTEM](renderBuildingPlacement) Building placement tool has been removed");
  });
};
