import createInput from "./createInput";
import getSceneLoadPromise from "./getSceneLoadPromise";
import createPhaserScene from "./createPhaserScene";
import { createCamera } from "./createCamera";
import createUpdater from "./createUpdater";
import createTilemap from "./createTilemap";
import { useEngineStore } from "../store/EngineStore";
import { SceneConfig } from "../../util/types";
import {
  generateFrames,
  createCulling,
  // createDebugger,
  createObjectPool,
  createChunks,
} from "@latticexyz/phaserx";

const createScene = async (config: SceneConfig, autoStart: boolean = true) => {
  const {
    camera: { minZoom, maxZoom, pinchSpeed, scrollSpeed, defaultZoom },
    tilemap: { chunkSize, tileWidth, tileHeight },
    cullingChunkSize,
    animations,
    tileAnimations,
    animationInterval,
    phaserGame,
  } = { ...config, ...useEngineStore.getState().game! };

  if (!phaserGame) throw new Error("Phaser game not initialized");

  const updater = createUpdater();

  const phaserScene = createPhaserScene({
    key: config.key,
    preload: (scene: Phaser.Scene) => {
      scene.load.pack(config.assetPackUrl);
    },
    update: (scene) => {
      updater.update(scene.time.now, scene.game.loop.rawDelta);
    },
  });

  const scene = new phaserScene();

  phaserGame.scene.add(config.key, scene, autoStart);

  await getSceneLoadPromise(scene);

  const camera = createCamera(scene.cameras.main, {
    maxZoom,
    minZoom,
    pinchSpeed,
    wheelSpeed: scrollSpeed,
  });

  const tilemap = createTilemap(
    scene,
    //@ts-ignore
    camera,
    tileWidth,
    tileHeight,
    chunkSize,
    tileAnimations,
    animationInterval
  );

  //create sprite animations
  if (animations) {
    for (const anim of animations) {
      scene.anims.create({
        key: anim.key,
        frames: generateFrames(scene.anims, anim),
        frameRate: anim.frameRate,
        repeat: anim.repeat,
      });
    }
  }

  // Setup object pool
  const objectPool = createObjectPool(scene);

  // Setup chunks for viewport culling
  const cullingChunks = createChunks(
    camera.worldView$,
    cullingChunkSize * tileWidth
  );

  // const debug = createDebugger(
  //   camera,
  //   cullingChunks,
  //   scene,
  //   objectPool,
  //   tilemap.map
  // );

  // Setup viewport culling
  const culling = createCulling(objectPool, camera, cullingChunks);

  const input = createInput(scene.input);

  camera.centerOn(0, 0);
  camera.setZoom(defaultZoom);

  return {
    phaserScene: scene,
    tilemap,
    scriptManager: updater,
    camera,
    culling,
    objectPool,
    config,
    input,
  };
};

export default createScene;
