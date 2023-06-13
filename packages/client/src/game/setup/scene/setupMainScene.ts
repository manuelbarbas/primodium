import {
  createCamera,
  getSceneLoadPromise,
  tileCoordToPixelCoord,
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

  const { x, y } = tileCoordToPixelCoord({ x: 0, y: 0 }, 16, 16);

  camera.centerOn(x, y);

  return {
    scene,
    config,
    tilemap,
    camera,
  };
};

export default setupMainScene;
