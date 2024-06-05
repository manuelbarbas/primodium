// STAR MAP ENTRY POINT
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { starmapSceneConfig } from "@/lib/config/starmapScene";
import { createSceneApi, PrimodiumScene } from "@/api/scene";
import { setupBasicCameraMovement } from "@/scenes/common/setup/setupBasicCameraMovement";
import { GlobalApi } from "@/api/global";
import { runSystems as runStarmapSystems } from "@/scenes/starmap/systems";

export const initStarmapScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(starmapSceneConfig, false);
  const sceneApi = createSceneApi(scene);

  setupBasicCameraMovement(sceneApi, {
    translateKeybind: true,
    doubleClickZoom: false,
  });

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
