import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import {
  ComponentUpdate,
  EntityID,
  Has,
  HasValue,
  defineEnterSystem,
  defineExitSystem,
  defineUpdateSystem,
  namespaceWorld,
} from "@latticexyz/recs";

import { AsteroidMap } from "@game/constants";
import { Scene } from "engine/types";
import { Path, Position } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { ObjectPosition } from "../../common/object-components/common";
import { ManhattanPath } from "../../common/object-components/graphics";
import { ActiveAsteroid } from "src/network/components/clientComponents";

export const renderBuildingPaths = (scene: Scene) => {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objSuffix = "_path";
  const gameWorld = namespaceWorld(world, "game");

  const render = (update: ComponentUpdate) => {
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

    const endEntityId = update.value[0]?.value?.toString() as EntityID;

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

    scene.objectPool.remove(objIndex);

    const embodiedPath = scene.objectPool.get(objIndex, "Graphics");

    embodiedPath.setComponents([
      ObjectPosition(
        {
          x: startPixelCoord.x + tileWidth / 2,
          y: -startPixelCoord.y + tileHeight / 2,
        },
        AsteroidMap.DepthLayers.Path
      ),
      ManhattanPath({
        x: endPixelCoord.x + tileWidth / 2,
        y: -endPixelCoord.y + tileHeight / 2,
      }),
    ]);
  };

  const pathQuery = [
    Has(Path),
    HasValue(Position, {
      parent: ActiveAsteroid.get()?.value,
    }),
  ];

  defineEnterSystem(gameWorld, pathQuery, render);

  defineUpdateSystem(gameWorld, pathQuery, render);

  defineExitSystem(gameWorld, pathQuery, ({ entity }) => {
    const renderId = `${entity}${objSuffix}`;
    scene.objectPool.remove(renderId);
  });
};
