// COMMAND CENTER ENTRY POINT
import { createSceneApi } from "@/game/api/scene";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";
import { Game } from "engine/types";

export const initCommandCenter = async (game: Game) => {
  const scene = await game.sceneManager.createScene(commandCenterScene, false);

  return { scene, api: createSceneApi(scene) };
};
