// UI MAP ENTRY POINT
import { createSceneApi, PrimodiumScene } from "@/game/api/scene";
import { Scenes } from "@/game/lib/constants/common";
import { uiSceneConfig } from "@game/lib/config/uiScene";
import { GlobalApi } from "@/game/api/global";
import { runSystems as runUISystems } from "@/game/scenes/ui/systems";
import { MUD } from "@/network/types";

export const initUIScene = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(uiSceneConfig, true);
  scene.phaserScene.scene.bringToTop(Scenes.UI);

  const sceneApi = createSceneApi(scene);
  const runSystems = (mud: MUD) => runUISystems(sceneApi, mud);
  return { ...sceneApi, runSystems };
};
