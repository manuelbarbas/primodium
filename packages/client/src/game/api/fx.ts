import { Assets, DepthLayers, SpriteKeys } from "@game/constants";
import { tileCoordToPixelCoord } from "@latticexyz/phaserx";
import { Coord, uuid } from "@latticexyz/utils";
import { Scene } from "engine/types";
import { components } from "src/network/components";
import { getDistance, getRandomRange } from "src/util/common";
import { ObjectPosition, OnComponentSystem, SetValue, Tween } from "../lib/common/object-components/common";
import { Texture } from "../lib/common/object-components/sprite";
import { ObjectText } from "../lib/common/object-components/text";

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
    options?: { speed?: number; delay?: number; numMissiles?: number; offsetMs?: number; spray?: number }
  ) {
    const delay = options?.delay ?? 0;
    const speed = options?.speed ?? 20;
    const numMissiles = options?.numMissiles ?? 10;
    const offset = options?.offsetMs ?? 150;
    const spray = options?.spray ?? 5;
    const { tileWidth, tileHeight } = scene.tilemap;
    const originPixelCoord = tileCoordToPixelCoord({ x: origin.x, y: -origin.y }, tileWidth, tileHeight);
    const destinationPixelCoord = tileCoordToPixelCoord({ x: destination.x, y: -destination.y }, tileWidth, tileHeight);

    const distance = getDistance(origin, destination);
    const duration = (distance * 10000) / speed;
    const animationTime = duration + numMissiles * offset + delay;

    for (let i = 0; i < numMissiles; i++) {
      const currOffset = i * offset + delay;
      setTimeout(() => {
        const missile = scene.phaserScene.add.circle(originPixelCoord.x, originPixelCoord.y, 2, 0xff0000);
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
      }, currOffset);
    }
    return animationTime;
  }

  function emitFloatingText(
    text: string,
    coord: Coord,
    options: {
      icon?: SpriteKeys;
      color?: number;
      delay?: number;
      prefixText?: boolean;
    } = {}
  ) {
    const { icon, color = 0xffffff, delay = 0, prefixText = false } = options;

    if (!scene.phaserScene.scene.isActive() || scene.phaserScene.scene.isPaused() || document.hidden) return;

    const { tileWidth, tileHeight } = scene.tilemap;
    const pixelCoord = tileCoordToPixelCoord({ x: coord.x, y: -coord.y }, tileWidth, tileHeight);
    const id = uuid();
    const group = scene.objectPool.getGroup(id);

    const _coord = { x: pixelCoord.x, y: pixelCoord.y };
    const duration = getRandomRange(1500, 2000);
    const xMove = getRandomRange(-10, 10);
    const yMove = getRandomRange(30, 50);

    const tweenConfig: Parameters<typeof Tween>["1"] = {
      duration,
      delay,
      onStart: () => {
        // Change the opacity of the object here
        scene.objectPool.getGroup(id).objects.forEach((entity) => {
          entity.setComponent(SetValue({ alpha: 1 }));
        });
      },
      props: {
        x: `+=${xMove}`,
        y: `-=${yMove}`,
        alpha: 0,
      },
      onComplete: () => {
        scene.objectPool.removeGroup(id);
      },
    };

    const sharedComponents = [
      ObjectPosition({ x: _coord.x, y: _coord.y }, DepthLayers.Path),
      OnComponentSystem(
        components.MapOpen,
        (_, { value }) => {
          if (value[1]?.value) return;

          scene.objectPool.removeGroup(id);
        },
        { runOnInit: false }
      ),
      Tween(scene, tweenConfig),
    ];

    if (icon) {
      group.add("Sprite").setComponents([
        SetValue({
          scale: 0.5,
          originY: 0.5,
          //dont like this but janky positioning works for now
          originX: prefixText ? -0.2 : 1,
          alpha: 0,
        }),
        Texture(Assets.SpriteAtlas, icon),
        ...sharedComponents,
      ]);
    }

    group.add("BitmapText").setComponents([
      ObjectText(text, {
        fontSize: getRandomRange(8, 12),
        color,
      }),
      SetValue({
        alpha: 0,
        originY: 0.5,
        //dont like this but janky positioning works for now
        originX: icon ? (prefixText ? 0.2 : -0.2) : 0,
      }),
      ...sharedComponents,
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
