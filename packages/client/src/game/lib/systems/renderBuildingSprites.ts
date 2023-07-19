import {
  ComponentUpdate,
  EntityID,
  Has,
  defineEnterSystem,
  defineExitSystem,
  getComponentValue,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

import { Coord } from "@latticexyz/utils";

import { createBuilding } from "../factory/building";
import { Network } from "src/network/layer";
import { Scene } from "src/engine/types";

export const renderBuildingSprites = (scene: Scene, network: Network) => {
  const { world, components } = network;
  const { tileHeight, tileWidth } = scene.tilemap;
  const objIndexSuffix = "_entitySprite";

  const query = [Has(components.Position), Has(components.Tile)];

  const render = (update: ComponentUpdate) => {
    const entityIndex = update.entity;
    const objIndex = entityIndex + objIndexSuffix;

    const tileCoord = getComponentValue(components.Position, entityIndex);

    const tile = getComponentValue(components.Tile, entityIndex);
    const tileEntityId = tile?.value as unknown as EntityID;

    if (!tileCoord) return;

    // don't render beyond coord map limitation
    if (Math.abs(tileCoord.x) > 32676 || Math.abs(tileCoord.y) > 32676) return;

    const pixelCoord = tileCoordToPixelCoord(
      tileCoord as Coord,
      tileWidth,
      tileHeight
    );

    if (!scene.objectPool.objects.has(objIndex)) {
      const buildingEmbodiedEntity = scene.objectPool.get(objIndex, "Sprite");

      const buildingComponent = createBuilding({
        id: objIndex,
        x: pixelCoord.x,
        y: -pixelCoord.y,
        tile: tileEntityId,
      });

      buildingEmbodiedEntity.setComponent(buildingComponent);
    }
  };

  defineEnterSystem(world, query, render);

  // not needed for now
  // defineUpdateSystem(world, query, render);

  defineExitSystem(world, query, (update) => {
    const objIndex = update.entity + objIndexSuffix;
    scene.objectPool.remove(objIndex);
  });
};
