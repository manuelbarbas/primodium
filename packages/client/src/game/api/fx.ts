import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord, uuid } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { getDistance, getRandomRange } from "src/util/common";
import { ObjectPosition, OnComponentSystem, Tween } from "../lib/common/object-components/common";
import { DepthLayers } from "@game/constants";
import { ObjectText } from "../lib/common/object-components/text";
import { components } from "src/network/components";

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
    const { tileWidth, tileHeight } = scene.tilemap;
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

  function fireMissile(
    origin: Coord,
    destination: Coord,
    options?: { speed?: number; numMissiles?: number; offsetMs?: number; spray?: number }
  ) {
    const speed = options?.speed ?? 20;
    const numMissiles = options?.numMissiles ?? 10;
    const offset = options?.offsetMs ?? 150;
    const spray = options?.spray ?? 5;
    const { tileWidth, tileHeight } = scene.tilemap;
    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);
    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const distance = getDistance(origin, destination);
    const duration = (distance * 10000) / speed;
    const animationTime = duration + numMissiles * offset;

    for (let i = 0; i < numMissiles; i++) {
      const currOffset = i * offset;
      setTimeout(() => {
        const missile = scene.phaserScene.add.circle(originPixelCoord.x, originPixelCoord.y, 2, 0xff0000);
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
      }, currOffset);
    }
    return animationTime;
  }

  function emitFloatingText(text: string, coord: Coord) {
    const { tileWidth, tileHeight } = scene.tilemap;
    const pixelCoord = tileCoordToPixelCoord({ x: coord.x, y: -coord.y }, tileWidth, tileHeight);
    const id = uuid();
    const group = scene.objectPool.getGroup(id);

    group.add("BitmapText").setComponents([
      ObjectPosition(
        { x: pixelCoord.x + getRandomRange(-10, 10), y: pixelCoord.y + getRandomRange(-10, 10) },
        DepthLayers.Path
      ),
      ObjectText(text, {
        fontSize: getRandomRange(8, 14),
        stroke: 0xff0000,
      }),
      OnComponentSystem(
        components.MapOpen,
        (_, { value }) => {
          if (value[1]?.value) return;

          scene.objectPool.removeGroup(id);
        },
        { runOnInit: false }
      ),
      Tween(scene, {
        duration: getRandomRange(700, 1500),
        props: {
          y: `-=${getRandomRange(30, 50)}`,
          x: `+=${getRandomRange(-10, 10)}`,
          alpha: 0, // fade out
        },
        onComplete: () => scene.objectPool.removeGroup(id),
      }),
    ]);
  }

  return {
    outline,
    removeOutline,
    emitExplosion,
    fireMissile,
    emitFloatingText,
  };
};
