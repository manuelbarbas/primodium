import {
  EntityID,
  defineComponentSystem,
  namespaceWorld,
} from "@latticexyz/recs";
import { Scene } from "engine/types";
import { Level } from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { getAsteroidBounds, getPlayerBounds } from "src/util/outOfBounds";
import { AsteroidMap } from "@game/constants";

const { FogTilekeys } = AsteroidMap;

export function renderFog(scene: Scene, player: EntityID) {
  const objSuffix = "_fog";
  const gameWorld = namespaceWorld(world, "game");
  const asteroidBounds = getAsteroidBounds();

  for (let x = asteroidBounds.minX; x <= asteroidBounds.maxX; x++) {
    for (let y = asteroidBounds.minY; y <= asteroidBounds.maxY; y++) {
      scene.tilemap.map.putTileAt({ x, y: -y }, FogTilekeys.Base, "Fog");
    }
  }

  defineComponentSystem(gameWorld, Level, ({ entity }) => {
    if (world.entities[entity] !== player) return;
    console.log("rendering rectange with cutout");
    const bounds = getPlayerBounds(player);
    const asteroidBounds = getAsteroidBounds();
    console.log("bounds:", bounds);
    console.log("asteroid bounds:", asteroidBounds);

    const objIndex = entity + objSuffix;
    if (scene.objectPool.objects.has(objIndex)) {
      scene.objectPool.remove(objIndex);
    }
    // const fog = scene.objectPool.get(objIndex, "Graphics");

    // Add 1 tile margin for transition tiles
    for (let x = bounds.minX - 1; x <= bounds.maxX + 1; x++) {
      for (let y = bounds.minY - 1; y <= bounds.maxY + 1; y++) {
        const maxRight = x > bounds.maxX;
        const maxLeft = x < bounds.minX;
        const maxTop = y > bounds.maxY;
        const maxBottom = y < bounds.minY;

        let index = FogTilekeys.Empty;

        if (maxLeft && maxTop) index = FogTilekeys.TopLeft;
        else if (maxLeft && maxBottom) index = FogTilekeys.BottomLeft;
        else if (maxRight && maxTop) index = FogTilekeys.TopRight;
        else if (maxRight && maxBottom) index = FogTilekeys.BottomRight;
        else if (maxLeft) index = FogTilekeys.Left;
        else if (maxRight) index = FogTilekeys.Right;
        else if (maxTop) index = FogTilekeys.Top;
        else if (maxBottom) index = FogTilekeys.Bottom;

        scene.tilemap.map.putTileAt({ x, y: -y }, index, "Fog");
      }
    }

    // fog.setComponent({
    //   id: `square_with_cutout_${uuid()}`,
    //   once: (gameObject) => {
    //     gameObject.fillStyle(0x000000, 0.8);

    //     gameObject.fillRect(
    //       asteroidBounds.minX * tileWidth,
    //       -asteroidBounds.minY * tileHeight,
    //       asteroidBounds.maxX * tileWidth,
    //       -asteroidBounds.maxY * tileHeight
    //     );
    //     const maskGraphics = scene.phaserScene.make.graphics({ x: 0, y: 0 });

    //     maskGraphics.fillStyle(0xffffff);
    //     maskGraphics.fillRect(
    //       bounds.minX * tileWidth,
    //       -bounds.minY * tileHeight,
    //       bounds.maxX * tileWidth,
    //       -bounds.maxY * tileHeight
    //     );

    //     const mask = new Phaser.Display.Masks.BitmapMask(
    //       scene.phaserScene,
    //       maskGraphics
    //     );
    //     mask.invertAlpha = true;

    //     gameObject.setMask(mask);
    //   },
    // });
  });
}
