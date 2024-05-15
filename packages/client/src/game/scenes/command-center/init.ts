// COMMAND CENTER ENTRY POINT
import { GlobalApi } from "@/game/api/global";
import { createSceneApi, PrimodiumScene } from "@/game/api/scene";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";
import { runSystems as runCommandSystems } from "@/game/scenes/command-center/systems";
import { components } from "@/network/components";
import { world } from "@/network/world";

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

  world.registerDisposer(() => {
    clickSub.unsubscribe();
  }, "game");

  const runSystems = () => runCommandSystems(sceneApi);
  return { ...sceneApi, runSystems };
};
