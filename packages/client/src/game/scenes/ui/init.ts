// UI MAP ENTRY POINT
import { Game } from "engine/types";
import { uiSceneConfig } from "@game/lib/config/uiScene";
import { Scenes } from "@/game/lib/constants/common";

export const initUIScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(uiSceneConfig, true);
  scene.phaserScene.scene.bringToTop(Scenes.UI);
};
