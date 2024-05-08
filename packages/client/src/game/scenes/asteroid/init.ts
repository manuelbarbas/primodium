// ASTEROID MAP ENTRY POINT
import { createSceneApi } from "@/game/api/scene";
import { Game } from "engine/types";
import { asteroidSceneConfig } from "../../lib/config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";

export const initAsteroidScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(asteroidSceneConfig, true);

  const sceneApi = createSceneApi(scene);

  setupMouseInputs(sceneApi);
  setupBasicCameraMovement(sceneApi);
  setupKeybinds(sceneApi);

  scene.camera.phaserCamera.fadeIn(1000);

  return sceneApi;
};
