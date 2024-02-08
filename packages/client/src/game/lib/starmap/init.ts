// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { Game } from "engine/types";
import { world } from "src/network/world";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { components } from "src/network/components";

export const initStarmapScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  const clickSub = scene.input.click$.subscribe(() => {
    components.SelectedRock.remove();
    components.SelectedFleet.remove();
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    game.dispose();
  }, "game");
};
