// ASTEROID MAP ENTRY POINT
import { AudioKeys } from "@game/constants";
import { Game } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { world } from "src/network/world";
import { asteroidSceneConfig } from "../../config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { setupTileManager } from "./setup/setupTileManager";

export const initAsteroidScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(asteroidSceneConfig, true);
  const audio = createAudioApi(scene);

  const tileManager = await setupTileManager(scene.tilemap);
  tileManager?.renderInitialChunks();
  tileManager?.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  audio.play(AudioKeys.Background, "music");
  audio.setPauseOnBlur(false);

  setupMouseInputs(scene);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
