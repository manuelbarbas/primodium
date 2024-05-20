import { Scene, Coord } from "engine/types";
import { DepthLayers } from "../lib/constants/common";
import { tileCoordToPixelCoord } from "engine/lib/util/coords";
import { Assets, Audio } from "@primodiumxyz/assets";
import { getRandomRange } from "@/util/common";

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

  function emitExplosion(coord: Coord, size: "sm" | "md" | "lg" = "md") {
    const speed = { sm: 50, md: 100, lg: 150 }[size];

    if (!scene.phaserScene.scene.isActive()) return;

    const particles = scene.phaserScene.add
      .particles(coord.x, coord.y, "flare", {
        speed,
        lifespan: 300,
        quantity: 10,
        scale: { start: 0.1, end: 0 },
        tintFill: true,
        // emitting: true,
        color: [0x472a00, 0x261c01, 0xf5efdf, 0xa3531a, 0xedb33e, 0xf5efdf],
        // emitZone: { type: 'edge', source: , quantity: 42 },
        // angle: 25,
        duration: 100,
      })
      .setDepth(DepthLayers.Path)
      .start();

    scene.audio.sfx.playAudioSprite(Assets.AudioAtlas, Audio.Explosion, {
      volume: size === "md" ? 0.5 : 0.2,
      detune: getRandomRange(-500, 500),
    });

    scene.phaserScene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  function emitFloatingText(coord: Coord, text: string, options?: { color?: number; duration?: number }) {
    const color = options?.color ?? 0x00ffff;
    const duration = options?.duration ?? 1000;

    const floatingText = scene.phaserScene.add
      .bitmapText(coord.x, coord.y, "teletactile", text, 4)
      .setDepth(DepthLayers.Marker)
      .setOrigin(0.5, 0)
      .setTintFill(color);

    scene.phaserScene.add
      .timeline([
        {
          at: 0,
          run: () => {
            scene.phaserScene.tweens.add({
              targets: floatingText,
              y: "-=20",
              ease: Phaser.Math.Easing.Quintic.In,
              duration,
            });
          },
        },

        {
          at: duration / 2,
          run: () => {
            scene.phaserScene.tweens.add({
              targets: floatingText,
              alpha: 0,
              ease: Phaser.Math.Easing.Quintic.In,
              duration: duration / 2,
            });
          },
        },
        {
          at: duration,
          run: () => floatingText.destroy(true),
        },
      ])
      .play();
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
  function getRGBValues(value: number) {
    const hexValue = value.toString(16).padStart(6, "0");
    const red = parseInt(hexValue.slice(0, 2), 16);
    const green = parseInt(hexValue.slice(2, 4), 16);
    const blue = parseInt(hexValue.slice(4, 6), 16);
    return { red, green, blue };
  }

  function flashScreen(options?: { duration?: number; color?: number }) {
    const duration = options?.duration ?? 500;
    const color = options?.color ?? 0x0;
    // Create a white rectangle that covers the entire screen
    const camera = scene.camera;
    const { red, green, blue } = getRGBValues(color);
    camera.phaserCamera.flash(duration, color % red, green, blue, true);
    camera.phaserCamera.shake(700, 0.02 / camera.phaserCamera.zoom);
  }

  return {
    outline,
    removeOutline,
    emitExplosion,
    emitFloatingText,
    fireMissile,
    flashScreen,
  };
};
