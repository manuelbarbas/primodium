// UI MAP ENTRY POINT
import { Game } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { uiSceneConfig } from "src/game/lib/config/uiScene";
import { AudioKeys } from "src/game/lib/constants/assets/audio";
import { Scenes } from "src/game/lib/constants/common";

export const initUIScene = async (game: Game) => {
  const scene = await game.sceneManager.addScene(uiSceneConfig, true);
  const audio = createAudioApi(scene);
  audio.initializeAudioVolume();
  scene.phaserScene.scene.bringToTop(Scenes.UI);

  audio.play(AudioKeys.Background, "music");
  audio.play(AudioKeys.Background2, "music", {
    loop: true,
    volume: 0,
  });
  audio.setPauseOnBlur(false);
};
