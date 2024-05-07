// ASTEROID MAP ENTRY POINT
import { api } from "@/game/api";
import { Game } from "engine/types";
import { asteroidSceneConfig } from "../../lib/config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";

export const initAsteroidScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(asteroidSceneConfig, true);

  const sceneApi = api(scene);

  setupMouseInputs(scene);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene);

  scene.camera.phaserCamera.fadeIn(1000);

  return { scene, api: sceneApi };
};
