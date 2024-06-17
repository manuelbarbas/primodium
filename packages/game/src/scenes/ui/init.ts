// UI MAP ENTRY POINT
import { createSceneApi } from "@game/api/scene";
import { uiSceneConfig } from "@game/lib/config/uiScene";
import { GlobalApi } from "@game/api/global";
import { runSystems as runUISystems } from "@game/scenes/ui/systems";
import { PrimodiumScene } from "@game/types";

export const initUIScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(uiSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  const runSystems = () => runUISystems();
  return { ...sceneApi, runSystems, isPrimary: true };
};
