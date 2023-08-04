// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/asteroid/game";
import mainSceneConfig from "../../config/asteroid/mainScene";
import { AsteroidMap } from "../../constants";
import { runSystems } from "./systems";
import { setupAsteroidChunkManager } from "./setup/setupChunkManager";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { EntityID } from "@latticexyz/recs";
import { setupKeybinds } from "./setup/setupKeybinds";

export const initAsteroidView = async (player: EntityID, network: Network) => {
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
  setupBasicCameraMovement(scene);
  setupKeybinds(scene, player);

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
