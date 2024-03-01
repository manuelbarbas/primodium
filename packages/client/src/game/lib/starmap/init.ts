// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../config/starmapScene";

import { Game } from "engine/types";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { setupKeybinds } from "../asteroid/setup/setupKeybinds";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { createAudioApi } from "src/game/api/audio";

export const initStarmapScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(starmapSceneConfig, false);
  const audio = createAudioApi(scene);
  audio.initializeAudioVolume();

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });
  setupKeybinds(scene);

  const clickSub = scene.input.click$.subscribe(([, objects]) => {
    if (objects.length !== 0) return;
    components.SelectedRock.remove();
    components.SelectedFleet.remove();
    components.Send.reset();
    components.Attack.reset();
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    game.dispose();
  }, "game");
};
