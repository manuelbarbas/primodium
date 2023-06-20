import {
  createCamera,
  createPhaserScene,
  getSceneLoadPromise,
  createPhaserGame,
} from "@smallbraingames/small-phaser";
import { Scenes } from "../constants";
import createUpdater from "./createUpdater";
import createGameTilemap from "./createGameTilemap";

interface SceneConfig {
  key: string;
  assetPackUrl: string;
  camera: {
    minZoom: number;
    maxZoom: number;
    pinchSpeed: number;
    scrollSpeed: number;
    defaultZoom: number;
  };
  tilemap: {
    chunkSize: number;
    tileWidth: number;
    tileHeight: number;
  };
}

const createScene = async (
  phaserGame: Awaited<ReturnType<typeof createPhaserGame>>,
  config: SceneConfig,
  autoStart: boolean = true
) => {
  const { minZoom, maxZoom, pinchSpeed, scrollSpeed, defaultZoom } =
    config.camera;
  const { chunkSize, tileWidth, tileHeight } = config.tilemap;

  const updater = createUpdater();

  const phaserScene = createPhaserScene({
    key: Scenes.Main,
    preload: (scene: Phaser.Scene) => {
      scene.load.pack(config.assetPackUrl);
    },
    update: (scene) => {
      updater.update(scene.time.now, scene.game.loop.actualFps);
    },
  });

  const scene = new phaserScene();

  phaserGame.game.scene.add(Scenes.Main, scene, autoStart);

  await getSceneLoadPromise(scene);

  const camera = createCamera(
    scene.cameras.main,
    minZoom,
    maxZoom,
    pinchSpeed,
    scrollSpeed
  );

  const tilemap = createGameTilemap(
    scene,
    //@ts-ignore
    camera,
    tileWidth,
    tileHeight,
    chunkSize
  );

  camera.centerOn(0, 0);
  camera.setZoom(defaultZoom);

  return {
    scene,
    tilemap,
    updater,
    camera,
    config,
  };
};

export default createScene;
