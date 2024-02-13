import { components } from "src/network/components";
import { Scene } from "engine/types";
import { Entity, defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { world } from "src/network/world";
import { getAsteroidBounds, getAsteroidMaxBounds } from "src/util/outOfBounds";
import { ObjectPosition, SetValue } from "../../common/object-components/common";
import { DepthLayers } from "@game/constants";
import { Square } from "../../common/object-components/graphics";

export const renderBounds = (scene: Scene) => {
  const systemsWorld = namespaceWorld(world, "systems");

  const { tileWidth, tileHeight } = scene.tilemap;

  defineComponentSystem(systemsWorld, components.ActiveRock, ({ value }) => {
    const activeRock = value[0]?.value as Entity;
    scene.objectPool.removeGroup("bounds");
    const maxBounds = getAsteroidMaxBounds(activeRock);
    const currentBounds = getAsteroidBounds(activeRock);

    if (!activeRock) return;

    const group = scene.objectPool.getGroup("bounds");

    group.add("Graphics", undefined, true).setComponents([
      ObjectPosition(
        {
          x: maxBounds.minX * tileWidth,
          y: (-maxBounds.minY + 1) * tileHeight,
        },
        DepthLayers.Rock
      ),
      Square((maxBounds.maxX - maxBounds.minX) * tileWidth, -(maxBounds.maxY - maxBounds.minY) * tileHeight, {
        alpha: 0,
        color: 0xff0000,
        borderThickness: 2,
      }),
      SetValue({
        alpha: 0.1,
      }),
    ]);

    group.add("Graphics", undefined, true).setComponents([
      ObjectPosition(
        {
          x: currentBounds.minX * tileWidth,
          y: (-currentBounds.minY + 1) * tileHeight,
        },
        DepthLayers.Rock
      ),
      Square(
        (currentBounds.maxX - currentBounds.minX) * tileWidth,
        -(currentBounds.maxY - currentBounds.minY) * tileHeight,
        {
          alpha: 0,
          color: 0xff00ff,
          borderThickness: 2,
        }
      ),
      SetValue({
        alpha: 0.1,
      }),
    ]);
  });
};
