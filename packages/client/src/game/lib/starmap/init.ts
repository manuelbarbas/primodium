// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { runSystems } from "./systems";

import { Game } from "engine/types";
import { world } from "src/network/world";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";

export const initStarmapScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
