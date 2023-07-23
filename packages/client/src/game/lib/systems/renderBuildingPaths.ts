import {
  EntityID,
  defineComponentSystem,
  getComponentValue,
  hasComponent,
} from "@latticexyz/recs";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";

import { createPath } from "../factory/path";
import { Scene } from "src/engine/types";
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
      const objIndex = entityIndex + objSuffix;
      // Avoid updating on optimistic overrides
      if (
        typeof entityIndex !== "number" ||
        entityIndex >= world.entities.length
      ) {
        return;
      }

      if (!hasComponent(Path, entityIndex)) {
        if (scene.objectPool.objects.has(objIndex)) {
          scene.objectPool.remove(objIndex);
        }
        return;
      }

      const startCoord = getComponentValue(Position, entityIndex) as Coord;

      const endEntityId = update.value[0]?.value.toString() as EntityID;

      //if path has no end tile, don't draw it
      if (!endEntityId) return;

      const endCoord = getComponentValue(
        Position,
        world.entityToIndex.get(endEntityId)!
      ) as Coord;

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
