import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Scene, Coord } from "engine/types";
import { DepthLayers } from "../lib/constants/common";

export const createFxApi = (scene: Scene) => {
  function outline(
    gameObject: Phaser.GameObjects.Sprite,
    options: {
      thickness?: number;
      color?: number;
      knockout?: boolean;
    } = {}
  ) {
    const { thickness = 3, color = 0xffff00, knockout } = options;

    if (!(gameObject instanceof Phaser.GameObjects.Sprite)) return;

    gameObject.postFX?.addGlow(color, thickness, undefined, knockout);
  }

  function removeOutline(gameObject: Phaser.GameObjects.Sprite) {
    gameObject.postFX.clear();
  }

  function emitExplosion(coord: Coord, size: "sm" | "md" = "md") {
    const { tileWidth, tileHeight } = scene.tiled;
    const pixelCoord = tileCoordToPixelCoord({ x: coord.x, y: -coord.y }, tileWidth, tileHeight);
    const speed = size == "md" ? 100 : 50;

    if (!scene.phaserScene.scene.isActive()) return;

    scene.phaserScene.add
      .particles(pixelCoord.x, pixelCoord.y, "flare", {
        speed,
        lifespan: 800,
        quantity: 10,
        scale: { start: 0.5, end: 0 },
        tintFill: true,
        // emitting: true,
        color: [0x472a00, 0x261c01, 0xf5efdf, 0xa3531a, 0xedb33e, 0xf5efdf],
        // emitZone: { type: 'edge', source: , quantity: 42 },
        duration: 300,
      })
      .start();
  }

  function fireMissile(origin: Coord, destination: Coord, options?: { duration?: number; spray?: number }) {
    const spray = options?.spray ?? 5;
    const { tileWidth, tileHeight } = scene.tiled;
    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);
    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const duration = options?.duration ?? 200;

    const missile = scene.phaserScene.add.circle(originPixelCoord.x, originPixelCoord.y, 2, 0xff0000);

    scene.phaserScene.add
      .timeline([
        {
          at: 0,
          run: () => {
            missile.setDepth(DepthLayers.Rock - 1);
            const randomizedDestination = {
              x: destinationPixelCoord.x + Phaser.Math.Between(-spray, spray),
              y: destinationPixelCoord.y + Phaser.Math.Between(-spray, spray),
            };

            scene.phaserScene.tweens.add({
              targets: missile,
              props: randomizedDestination,
              ease: Phaser.Math.Easing.Quintic.In,
              duration,
            });
            setTimeout(() => {
              missile.destroy(true);
            }, duration);
          },
        },
        {
          at: duration,
          run: () => missile.destroy(true),
        },
      ])
      .play();
  }

  return {
    outline,
    removeOutline,
    emitExplosion,
    fireMissile,
  };
};
