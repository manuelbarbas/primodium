// UI MAP ENTRY POINT
import { MUD } from "@primodiumxyz/core/network/types";

import { createSceneApi, PrimodiumScene } from "@/api/scene";
import { uiSceneConfig } from "@/lib/config/uiScene";
import { GlobalApi } from "@/api/global";
import { runSystems as runUISystems } from "@/scenes/ui/systems";

export const initUIScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(uiSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  const runSystems = (mud: MUD) => runUISystems(sceneApi, mud);
  return { ...sceneApi, runSystems, isPrimary: true };
};
