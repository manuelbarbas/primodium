// COMMAND CENTER ENTRY POINT
import { Core } from "@primodiumxyz/core";

import { GlobalApi } from "@game/api/global";
import { createSceneApi } from "@game/api/scene";
import { PrimodiumScene } from "@game/types";
import { commandCenterScene } from "@game/lib/config/commandCenterScene";
import { runSystems as runCommandSystems } from "@game/scenes/command-center/systems";

export const initCommandCenter = async (game: GlobalApi, core: Core): Promise<PrimodiumScene> => {
  const {
    tables,
    network: { world },
  } = core;
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

    tables.SelectedFleet.remove();
    tables.BattleTarget.remove();
  });

  const sceneApi = createSceneApi(scene);

  sceneApi.audio.setPauseOnBlur(false);

  world.registerDisposer(() => {
    clickSub.unsubscribe();
  }, "game");

  const runSystems = () => runCommandSystems(sceneApi, core);
  return { ...sceneApi, runSystems };
};
