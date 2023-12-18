import { DepthLayers, FogTilekeys } from "@game/constants";
import { defineComponentSystem, namespaceWorld } from "@latticexyz/recs";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getAsteroidBounds, getSpaceRockBounds } from "src/util/outOfBounds";
import { ObjectPosition, SetValue } from "../../common/object-components/common";
import { Square } from "../../common/object-components/graphics";
import { ObjectText } from "../../common/object-components/text";

export function renderFog(scene: Scene) {
  const { tileWidth, tileHeight } = scene.tilemap;
  const objSuffix = "_fog";
  const gameWorld = namespaceWorld(world, "game");
  const _gameWorld = namespaceWorld(world, "game_fog");
  const asteroidBounds = getAsteroidBounds();

  defineComponentSystem(gameWorld, components.ActiveRock, ({ value }) => {
    //remove old indicators
    scene.objectPool.removeGroup(value[1]?.value + objSuffix);

    //dispose old system
    world.dispose("game_fog");

    //place initial fog tiles
    for (let x = asteroidBounds.minX; x <= asteroidBounds.maxX - 1; x++) {
      for (let y = asteroidBounds.minY; y <= asteroidBounds.maxY - 1; y++) {
        const maxRight = x === asteroidBounds.maxX - 1;
        const maxLeft = x === asteroidBounds.minX;
        const maxTop = y === asteroidBounds.maxY - 1;
        const maxBottom = y === asteroidBounds.minY;

        let index = FogTilekeys.Base;

        if (maxLeft && maxTop) index = FogTilekeys.OuterTopLeft;
        else if (maxLeft && maxBottom) index = FogTilekeys.OuterBottomLeft;
        else if (maxRight && maxTop) index = FogTilekeys.OuterTopRight;
        else if (maxRight && maxBottom) index = FogTilekeys.OuterBottomRight;
        else if (maxLeft) index = FogTilekeys.OuterLeft;
        else if (maxRight) index = FogTilekeys.OuterRight;
        else if (maxTop) index = FogTilekeys.OuterTop;
        else if (maxBottom) index = FogTilekeys.OuterBottom;

        scene.tilemap.map?.putTileAt({ x, y: -y }, index, "GameFog");
      }
    }

    defineComponentSystem(_gameWorld, components.Level, ({ entity }) => {
      // const playerEntity = components.Account.get()?.value;
      // if (components.Home.get(playerEntity)?.asteroid != entity) return;

      if (value[0] && value[0].value !== entity) return;

      const bounds = getSpaceRockBounds(entity);
      const nextBounds = getSpaceRockBounds(entity, true);

      const objIndex = entity + objSuffix;
      if (scene.objectPool.objects.has(objIndex)) {
        scene.objectPool.remove(objIndex);
      }

      scene.objectPool.removeGroup(objIndex);
      const group = scene.objectPool.getGroup(objIndex);

      group.add("Graphics").setComponents([
        ObjectPosition(
          {
            x: nextBounds.minX * tileWidth,
            y: (-nextBounds.minY + 1) * tileHeight,
          },
          DepthLayers.Rock
        ),
        Square(
          (nextBounds.maxX - nextBounds.minX + 1) * tileWidth,
          -(nextBounds.maxY - nextBounds.minY + 1) * tileHeight,
          {
            alpha: 0,
            color: 0x00ffff,
          }
        ),
        SetValue({
          alpha: 0.1,
        }),
      ]);

      group.add("BitmapText").setComponents([
        ObjectPosition(
          {
            x: nextBounds.minX * tileWidth,
            y: (-nextBounds.minY + 1) * tileHeight,
          },
          DepthLayers.Path
        ),
        SetValue({
          originX: 0,
          originY: -0.5,
          alpha: 0.7,
        }),
        ObjectText(bounds.maxX !== nextBounds.maxX ? "+ NEXT EXPANSION" : "FINAL EXPANSION", {
          color: 0x00ffff,
          fontSize: 10,
        }),
      ]);

      // clear fog from expansion area
      // Add 1 tile margin for transition tiles
      for (let x = bounds.minX - 1; x <= bounds.maxX + 1; x++) {
        for (let y = bounds.minY - 1; y <= bounds.maxY + 1; y++) {
          const maxRight = x > bounds.maxX;
          const maxLeft = x < bounds.minX;
          const maxTop = y > bounds.maxY;
          const maxBottom = y < bounds.minY;

          let index = FogTilekeys.Empty;

          if (bounds.maxX !== nextBounds.maxX) {
            if (maxLeft && maxTop) index = FogTilekeys.TopLeft;
            else if (maxLeft && maxBottom) index = FogTilekeys.BottomLeft;
            else if (maxRight && maxTop) index = FogTilekeys.TopRight;
            else if (maxRight && maxBottom) index = FogTilekeys.BottomRight;
            else if (maxLeft) index = FogTilekeys.Left;
            else if (maxRight) index = FogTilekeys.Right;
            else if (maxTop) index = FogTilekeys.Top;
            else if (maxBottom) index = FogTilekeys.Bottom;
          }

          scene.tilemap.map?.putTileAt({ x, y: -y }, index, "GameFog");
        }
      }
    });
  });
}
