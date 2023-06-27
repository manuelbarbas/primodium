import {
  EntityID,
  defineComponentSystem,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

import { Coord } from "@latticexyz/utils";
import { Network } from "../../../network/layer";

import { createPath } from "../factory/path";
import { Scene } from "../../../engine/types";

export const createPathSystem = (network: Network, scene: Scene) => {
  const { world, components } = network;
  const { tileWidth, tileHeight } = scene.tilemap;

  defineComponentSystem(
    world,
    components.Path,
    (update) => {
      const entityIndex = update.entity;
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      if (!hasComponent(components.Path, entityIndex)) {
        if (scene.objectPool.objects.has(entityIndex + "_path")) {
          scene.objectPool.remove(entityIndex + "_path");
        }
        return;
      }

      const startCoord = getComponentValue(
        components.Position,
        entityIndex
      ) as Coord;

      const endEntityId = update.value[0]?.value.toString() as EntityID;

      //if path has no end tile, don't draw it
      if (!endEntityId) return;

      const endCoord = getComponentValue(
        components.Position,
        world.entityToIndex.get(endEntityId)!
      ) as Coord;

      const startPixelCoord = tileCoordToPixelCoord(
        startCoord,
        tileWidth,
        tileHeight
      );

      const endPixelCoord = tileCoordToPixelCoord(
        endCoord,
        tileWidth,
        tileHeight
      );

      if (!scene.objectPool.objects.has(entityIndex + "_path")) {
        const embodiedPath = scene.objectPool.get(
          entityIndex + "_path",
          "Graphics"
        );

        const pathComponent = createPath(
          startPixelCoord.x + tileWidth / 2,
          -startPixelCoord.y + tileHeight / 2,
          endPixelCoord.x + tileWidth / 2,
          -endPixelCoord.y + tileHeight / 2,
          20,
          1
        );

        embodiedPath.setComponent(pathComponent);
      }
    },
    { runOnInit: true }
  );
};
