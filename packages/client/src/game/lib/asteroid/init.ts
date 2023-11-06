// ASTEROID MAP ENTRY POINT
import { asteroidSceneConfig } from "../../config/asteroidScene";
import { runSystems } from "./systems";
import { setupTileManager } from "./setup/setupTileManager";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { setupKeybinds } from "./setup/setupKeybinds";
import { SetupResult } from "src/network/types";
import { Game } from "engine/types";

export const initAsteroidScene = async (game: Game, mud: SetupResult) => {
  const { world } = mud.network;

  const scene = await game.sceneManager.addScene(asteroidSceneConfig, true);

  scene.camera.phaserCamera.setRoundPixels(false);

  const tileManager = await setupTileManager(scene.tilemap);
  tileManager?.renderInitialChunks();
  tileManager?.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene, mud);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene, mud);

  runSystems(scene, mud);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
