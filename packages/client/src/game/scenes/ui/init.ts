// UI MAP ENTRY POINT
import { Game } from "engine/types";
import { createAudioApi } from "@game/api/audio";
import { uiSceneConfig } from "@game/lib/config/uiScene";
import { Scenes } from "@game/lib/constants/common";

export const initUIScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(uiSceneConfig, true);
  const audio = createAudioApi(scene);
  audio.initializeAudioVolume();
  scene.phaserScene.scene.bringToTop(Scenes.UI);

  audio.play("Background", "music");
  audio.play("Background2", "music", {
    loop: true,
    volume: 0,
  });
  audio.setPauseOnBlur(false);
};
