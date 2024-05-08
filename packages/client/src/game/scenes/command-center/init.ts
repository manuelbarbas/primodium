// COMMAND CENTER ENTRY POINT
import { GameApi } from "@/game/api/game";
import { createSceneApi, SceneApi } from "@/game/api/scene";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";

export const initCommandCenter = async (game: GameApi): Promise<SceneApi> => {
  const scene = await game.createScene(commandCenterScene, false);

  return createSceneApi(scene);
};
