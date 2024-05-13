// COMMAND CENTER ENTRY POINT
import { GlobalApi } from "@/game/api/global";
import { createSceneApi, PrimodiumScene } from "@/game/api/scene";
import { commandCenterScene } from "@/game/lib/config/commandCenterScene";
import { runSystems as runCommandSystems } from "@/game/scenes/command-center/systems";

export const initCommandCenter = async (game: GlobalApi): Promise<PrimodiumScene> => {
  const scene = await game.createScene(commandCenterScene, false);

  scene.camera.phaserCamera.pan(0, 0, 100);

  const sceneApi = createSceneApi(scene);
  const runSystems = () => runCommandSystems(sceneApi);
  return { ...sceneApi, runSystems };
};
