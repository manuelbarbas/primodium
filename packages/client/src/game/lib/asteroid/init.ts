// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import mainSceneConfig from "../../config/asteroid/mainScene";
import { Scenes } from "../../constants";
import { runSystems } from "./systems";
import { setupTileManager } from "./setup/setupTileManager";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { setupKeybinds } from "./setup/setupKeybinds";

export const initAsteroidScene = async (
  game: Awaited<ReturnType<typeof engine.createGame>>,
  network: Network
) => {
  const { world } = network;

  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  scene.camera.phaserCamera.setRoundPixels(false);

  const tileManager = await setupTileManager(scene.tilemap);
  tileManager.renderInitialChunks();
  tileManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene, network);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene);

  runSystems(scene, network);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
