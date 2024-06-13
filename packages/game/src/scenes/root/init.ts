// ROOT ENTRY POINT
import { Core } from "@primodiumxyz/core";

import { GlobalApi } from "@/api/global";
import { createSceneApi, PrimodiumScene } from "@/api/scene";
import { rootSceneConfig } from "@/lib/config/rootScene";
import { runSystems as runRootSystems } from "@/scenes/root/systems";

export const initRootScene = async (game: GlobalApi, core: Core): Promise<PrimodiumScene> => {
  const scene = await game.createScene(rootSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  sceneApi.audio.setPauseOnBlur(false);

  const runSystems = () => runRootSystems(sceneApi, game, core);
  return { ...sceneApi, runSystems, isPrimary: true };
};
