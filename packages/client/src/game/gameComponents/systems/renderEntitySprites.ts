import {
  EntityID,
  defineComponentSystem,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

import { Coord } from "@latticexyz/utils";

import { createBuilding } from "../factory/building";
import { Network } from "src/network/layer";
import { Scene } from "src/engine/types";

export const renderEntitySprites = (scene: Scene, network: Network) => {
  const { world, components } = network;
  const { tileHeight, tileWidth } = scene.tilemap;
  const objIndexSuffix = "_entitySprite";

  defineComponentSystem(
    world,
    components.Position,
    (update) => {
      const entityIndex = update.entity;
      const objIndex = entityIndex + objIndexSuffix;

      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      //handle destroy
      if (!hasComponent(components.Position, entityIndex)) {
        if (scene.objectPool.objects.has(objIndex)) {
          scene.objectPool.remove(objIndex);
        }
        return;
      }

      const tilePosition = update.value[0];

      const tile = getComponentValue(components.Tile, entityIndex);
      const tileEntityId = tile?.value as unknown as EntityID;

      const pixelCoord = tileCoordToPixelCoord(
        tilePosition as Coord,
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
    },
    { runOnInit: true }
  );
};
