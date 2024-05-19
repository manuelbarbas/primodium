// STAR MAP ENTRY POINT
import { starmapSceneConfig } from "../../lib/config/starmapScene";

import { createSceneApi, PrimodiumScene } from "@/game/api/scene";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { setupKeybinds } from "../asteroid/setup/setupKeybinds";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { GlobalApi } from "@/game/api/global";
import { runSystems as runStarmapSystems } from "@/game/scenes/starmap/systems";

export const initStarmapScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(starmapSceneConfig, false);
  const sceneApi = createSceneApi(scene);

  setupBasicCameraMovement(sceneApi, {
    translateKeybind: true,
  });
  setupKeybinds(sceneApi);

  const clickSub = scene.input.click$.subscribe(([pointer, objects]) => {
    //if we have more than one object, we want to emit the pointerdown and pointerup events on all of them except the first one
    if (objects.length > 1) {
      objects.slice(1).forEach((obj) => {
        obj.emit("pointerdown", pointer);
        obj.emit("pointerup", pointer);
      });
      return;
    }

    if (objects.length !== 0) return;
    components.SelectedRock.remove();
    components.SelectedFleet.remove();
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
  }, "game");

  const runSystems = () => runStarmapSystems(sceneApi);

  return { ...sceneApi, runSystems };
};
