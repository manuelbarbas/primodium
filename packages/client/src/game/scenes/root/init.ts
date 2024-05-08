// ROOT ENTRY POINT
import { GameApi } from "@/game/api/game";
import { createSceneApi, SceneApi } from "@/game/api/scene";
import { rootSceneConfig } from "@game/lib/config/rootScene";
import { runSystems as runRootSystems } from "src/game/scenes/root/systems";

export const initRootScene = async (game: GameApi): Promise<SceneApi> => {
  const scene = await game.createScene(rootSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  sceneApi.audio.play("Background", "music");
  sceneApi.audio.play("Background2", "music", {
    loop: true,
    volume: 0,
  });
  sceneApi.audio.setPauseOnBlur(false);

  const runSystems = () => runRootSystems(sceneApi, game);
  return { ...sceneApi, runSystems };
};
