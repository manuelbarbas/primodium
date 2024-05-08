// ASTEROID MAP ENTRY POINT
import { createSceneApi, SceneApi } from "@/game/api/scene";
import { asteroidSceneConfig } from "../../lib/config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { MUD } from "@/network/types";
import { runSystems as runAsteroidSystems } from "src/game/scenes/asteroid/systems";
import { GameApi } from "@/game/api/game";

export const initAsteroidScene = async (game: GameApi): Promise<SceneApi> => {
  const scene = await game.createScene(asteroidSceneConfig, true);

  const sceneApi = createSceneApi(scene);

  setupMouseInputs(sceneApi);
  setupBasicCameraMovement(sceneApi);
  setupKeybinds(sceneApi);

  scene.camera.phaserCamera.fadeIn(1000);
  const runSystems = (mud: MUD) => runAsteroidSystems(sceneApi, mud);

  return { ...sceneApi, runSystems };
};
