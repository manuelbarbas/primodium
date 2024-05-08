// COMMAND CENTER ENTRY POINT
import { Game } from "engine/types";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";

export const initCommandCenter = async (game: Game) => {
  const scene = await game.sceneManager.createScene(commandCenterScene, false);

  scene.camera.phaserCamera.pan(0, 0, 100);
};
