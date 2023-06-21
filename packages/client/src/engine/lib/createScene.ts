import {
  createCamera,
  createPhaserScene,
  getSceneLoadPromise,
  createInput,
} from "@smallbraingames/small-phaser";
import createUpdater from "./createUpdater";
import createTilemap from "./createTilemap";
import { useEngineStore } from "../store/EngineStore";
import { SceneConfig } from "../../util/types";

const createScene = async (config: SceneConfig, autoStart: boolean = true) => {
  const { minZoom, maxZoom, pinchSpeed, scrollSpeed, defaultZoom } =
    config.camera;
  const { chunkSize, tileWidth, tileHeight } = config.tilemap;
  const phaserGame = useEngineStore.getState().game?.phaserGame;

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

  phaserGame.game.scene.add(config.key, scene, autoStart);

  await getSceneLoadPromise(scene);

  const camera = createCamera(
    scene.cameras.main,
    minZoom,
    maxZoom,
    pinchSpeed,
    scrollSpeed
  );

  const tilemap = createTilemap(
    scene,
    //@ts-ignore
    camera,
    tileWidth,
    tileHeight,
    chunkSize
  );

  const input = createInput(scene.input);

  camera.centerOn(0, 0);
  camera.setZoom(defaultZoom);

  return {
    phaserScene: scene,
    tilemap,
    scriptManager: updater,
    camera,
    config,
    input,
  };
};

export default createScene;
