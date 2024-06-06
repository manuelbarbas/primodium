// COMMAND CENTER ENTRY POINT
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";

import { GlobalApi } from "@/api/global";
import { createSceneApi, PrimodiumScene } from "@/api/scene";
import { commandCenterScene } from "@/lib/config/commandCenterScene";
import { runSystems as runCommandSystems } from "@/scenes/command-center/systems";

export const initCommandCenter = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(commandCenterScene, false);

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

    components.SelectedFleet.remove();
    components.BattleTarget.remove();
  });

  const sceneApi = createSceneApi(scene);

  sceneApi.audio.setPauseOnBlur(false);

  world.registerDisposer(() => {
    clickSub.unsubscribe();
  }, "game");

  const runSystems = () => runCommandSystems(sceneApi);
  return { ...sceneApi, runSystems };
};
