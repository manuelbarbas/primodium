// PRIMODIUM ENTRY POINT
import { engine } from "../../engine";
import { Network } from "../../network/layer";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import { createSpriteSystem } from "../gameComponents/system/createBuildingSystem";
import { createPathSystem } from "../gameComponents/system/createPathSystem";

import createChunkManager from "./managers/chunkManager";

export const init = async (network: Network) => {
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  createSpriteSystem(network, scene);
  createPathSystem(network, scene);
};
