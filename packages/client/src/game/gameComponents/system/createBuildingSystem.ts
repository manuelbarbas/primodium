import {
  EntityID,
  defineComponentSystem,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

import { Coord } from "@latticexyz/utils";
import { Network } from "../../../network/layer";
import { Scene } from "../../../engine/types";
import { createBuilding } from "../factory/building";

export const createSpriteSystem = (network: Network, scene: Scene) => {
  const { world, components } = network;

  const { tileHeight, tileWidth } = scene.tilemap;

  defineComponentSystem(
    world,
    components.Position,
    (update) => {
      const entityIndex = update.entity;
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      //handle destroy
      if (!hasComponent(components.Position, entityIndex)) {
        if (scene.objectPool.objects.has(entityIndex.toString())) {
          scene.objectPool.remove(entityIndex);
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

      if (!scene.objectPool.objects.has(entityIndex.toString())) {
        const buildingEmbodiedEntity = scene.objectPool.get(
          entityIndex,
          "Sprite"
        );

        const buildingComponent = createBuilding(
          pixelCoord.x,
          -pixelCoord.y,
          tileEntityId
        );

        buildingEmbodiedEntity.setComponent(buildingComponent);
      }
    },
    { runOnInit: true }
  );
};
