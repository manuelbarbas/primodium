// ROOT ENTRY POINT
import { Game } from "engine/types";
import { createAudioApi } from "@game/api/audio";
import { rootSceneConfig } from "@game/lib/config/rootScene";

export const initRootScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(rootSceneConfig, true);
  const audio = createAudioApi(scene);
  audio.initializeAudioVolume();

  audio.play("Background", "music");
  audio.play("Background2", "music", {
    loop: true,
    volume: 0,
  });
  audio.setPauseOnBlur(false);
};
