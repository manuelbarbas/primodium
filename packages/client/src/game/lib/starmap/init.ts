// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { runSystems } from "./systems";

import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { SetupResult } from "src/network/types";
import { Game } from "engine/types";

export const initStarmapScene = async (game: Game, mud: SetupResult) => {
  const { world } = mud.network;

  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
