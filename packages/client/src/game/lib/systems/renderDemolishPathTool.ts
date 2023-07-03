import {
  ComponentUpdate,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
} from "@latticexyz/recs";
import { Network } from "src/network/layer";
import { Scene } from "src/engine/types";
import { BlockType } from "src/util/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { createSelectionTile } from "../factory/selectionTile";

export const renderDemolishPathTool = (scene: Scene, network: Network) => {
  const { world, offChainComponents } = network;
  const { tileWidth, tileHeight } = scene.tilemap;
  const objIndexSuffix = "_demolishPath";

  const query = [
    Has(offChainComponents.HoverTile),
    HasValue(offChainComponents.SelectedBuilding, {
      value: BlockType.DemolishPath,
    }),
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

    const tileCoord = update.value[0] as Coord;

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
        color: 0xffa500,
      })
    );
  };

  defineEnterSystem(world, query, (update) => {
    render(update);

    console.info(
      "[ENTER SYSTEM](renderDemolishPath) Demolish Path tool has been added"
    );
  });

  defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objGraphicsIndex = update.entity + "_graphics" + objIndexSuffix;
    scene.objectPool.remove(objGraphicsIndex);

    console.info(
      "[EXIT SYSTEM](renderDemolishPath) Demolish Path tool has been removed"
    );
  });
};
