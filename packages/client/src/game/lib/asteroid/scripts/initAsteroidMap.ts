// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../../network/layer";
import gameConfig from "../../../config/asteroid/gameConfig";
import mainSceneConfig from "../../../config/asteroid/scenes/mainSceneConfig";
import { AsteroidMap } from "../../../constants";
import { runSystems } from "../systems";
import { setupAsteroidChunkManager } from "./setup/setupAsteroidChunkManager";
import setupCameraMovement from "./setup/setupCameraMovement";
import setupMouseInputs from "./setup/setupMouseInputs";
import { EntityID } from "@latticexyz/recs";

export const initAsteroidMap = async (player: EntityID, network: Network) => {
  const { Scenes } = AsteroidMap;
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  const chunkManager = await setupAsteroidChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene, network, player);
  setupCameraMovement(scene, player);

  runSystems(scene);

  world.registerDisposer(() => {
    chunkManager.dispose();
    game.dispose();
  });
};
