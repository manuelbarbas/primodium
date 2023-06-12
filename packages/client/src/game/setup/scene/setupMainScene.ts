import {
  createCamera,
  getSceneLoadPromise,
} from "@smallbraingames/small-phaser";

import { GameConfig } from "../../../util/types";
import createGameTilemap from "../../helpers/createGameTilemap";

const setupMainScene = async (scene: Phaser.Scene, config: GameConfig) => {
  await getSceneLoadPromise(scene);
  const { minZoom, maxZoom, pinchSpeed, scrollSpeed } = config.camera;

  const tilemap = createGameTilemap(scene, config);
  const camera = createCamera(
    scene.cameras.main,
    minZoom,
    maxZoom,
    pinchSpeed,
    scrollSpeed
  );

  return {
    scene,
    config,
    tilemap,
    camera,
  };
};

export default setupMainScene;
