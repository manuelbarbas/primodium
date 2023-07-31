import { EntityID, defineComponentSystem } from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";

import { createPath } from "../../factory/path";
import { Scene } from "engine/types";
import { world } from "src/network/world";
import { Path } from "src/network/components/chainComponents";
import { Position } from "src/network/components/clientComponents";

export const renderBuildingPaths = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objSuffix = "_path";

  defineComponentSystem(
    world,
    Path,
    (update) => {
      const entityIndex = update.entity;
      const entity = world.entities[entityIndex];
      const objIndex = entityIndex + objSuffix;
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      if (!Path.has(entity)) {
        if (scene.objectPool.objects.has(objIndex)) {
          scene.objectPool.remove(objIndex);
        }
        return;
      }

      const startCoord = Position.get(entity);

      const endEntityId = update.value[0]?.value.toString() as EntityID;

      //if path has no end tile, don't draw it
      if (!endEntityId) return;

      const endCoord = Position.get(endEntityId);

      //if endCoord or startCoord are not defined, don't draw path
      if (!endCoord || !startCoord) return;

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

      if (!scene.objectPool.objects.has(objIndex)) {
        const embodiedPath = scene.objectPool.get(objIndex, "Graphics");

        const pathComponent = createPath({
          id: objIndex,
          startX: startPixelCoord.x + tileWidth / 2,
          startY: -startPixelCoord.y + tileHeight / 2,
          endX: endPixelCoord.x + tileWidth / 2,
          endY: -endPixelCoord.y + tileHeight / 2,
        });

        embodiedPath.setComponent(pathComponent);
      }
    },
    { runOnInit: true }
  );
};
