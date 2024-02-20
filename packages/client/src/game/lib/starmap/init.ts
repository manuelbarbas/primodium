// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { Game } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { setupKeybinds } from "../asteroid/setup/setupKeybinds";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";

export const initStarmapScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });
  setupKeybinds(scene);

  scene.input.phaserInput.on("pointerdown", (_: unknown, objectsClicked: unknown[]) => {
    if (objectsClicked.length === 0) {
      components.SelectedRock.remove();
      components.SelectedFleet.remove();
    }
  });
  const clickSub = scene.input.click$.subscribe(() => {});

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    game.dispose();
  }, "game");
};
