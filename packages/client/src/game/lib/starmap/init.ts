// STAR MAP ENTRY POINT
import { Network } from "../../../network/layer";
import { starmapSceneConfig } from "../../config/starmapScene";

import { runSystems } from "./systems";

import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { createGame } from "engine/api";

export const initStarmapScene = async (
  game: Awaited<ReturnType<typeof createGame>>,
  network: Network
) => {
  const { world } = network;

  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
