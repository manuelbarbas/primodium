// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { runSystems } from "./systems";

import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { createGame } from "engine/api";
import { SetupResult } from "src/network/types";

export const initStarmapScene = async (game: Awaited<ReturnType<typeof createGame>>, mud: SetupResult) => {
  const { world } = mud.network;

  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  // runSystems(scene, mud);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
