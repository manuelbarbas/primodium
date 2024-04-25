// COMMAND CENTER ENTRY POINT
import { Game } from "engine/types";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";

export const initCommandCenter = async (game: Game) => {
  await game.sceneManager.createScene(commandCenterScene, false);
};
