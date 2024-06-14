// UI MAP ENTRY POINT
import { createSceneApi } from "@/api/scene";
import { uiSceneConfig } from "@/lib/config/uiScene";
import { GlobalApi } from "@/api/global";
import { runSystems as runUISystems } from "@/scenes/ui/systems";
import { PrimodiumScene } from "@/types";

export const initUIScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(uiSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  const runSystems = () => runUISystems();
  return { ...sceneApi, runSystems, isPrimary: true };
};
