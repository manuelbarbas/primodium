// UI MAP ENTRY POINT
import { createSceneApi } from "@/game/api/scene";
import { Scenes } from "@/game/lib/constants/common";
import { uiSceneConfig } from "@game/lib/config/uiScene";
import { Game } from "engine/types";

export const initUIScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(uiSceneConfig, true);
  scene.phaserScene.scene.bringToTop(Scenes.UI);

  return createSceneApi(scene);
};
