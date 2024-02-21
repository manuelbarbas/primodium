// ASTEROID MAP ENTRY POINT
import { AudioKeys, Scenes } from "@game/constants";
import { Game } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { world } from "src/network/world";
import { asteroidSceneConfig } from "../../config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { setupTileManager } from "./setup/setupTileManager";
import { uiSceneConfig } from "src/game/config/uiScene";
import { defineComponentSystem } from "@latticexyz/recs";
import { components } from "src/network/components";

export const initAsteroidScene = async (game: Game) => {
  const scene2 = await game.sceneManager.addScene(uiSceneConfig, true);
  const scene = await game.sceneManager.addScene(asteroidSceneConfig, true);
  const audio = createAudioApi(scene);

  const tileManager = await setupTileManager(scene.tilemap);
  tileManager?.renderInitialChunks();
  tileManager?.startChunkRenderer();

  scene2.phaserScene.scene.bringToTop(Scenes.UI);
  scene2.phaserScene.input.enabled = false;

  scene.camera.phaserCamera.fadeIn(1000);

  audio.play(AudioKeys.Background, "music");
  audio.play(AudioKeys.Background2, "music", {
    loop: true,
  });
  audio.setPauseOnBlur(false);
  const bg = audio.get(AudioKeys.Background, "music");
  const bg2 = audio.get(AudioKeys.Background2, "music");

  defineComponentSystem(world, components.MapOpen, ({ value }) => {
    if (!bg || !bg2) return;

    if (value[0]?.value) {
      scene2.phaserScene.add.tween({
        targets: bg,
        volume: 0,
        duration: 3000,
      });

      scene2.phaserScene.add.tween({
        targets: bg2,
        volume: 1,
        duration: 3000,
      });
    } else {
      scene2.phaserScene.add.tween({
        targets: bg,
        volume: 1,
        duration: 3000,
      });

      scene2.phaserScene.add.tween({
        targets: bg2,
        volume: 0,
        duration: 3000,
      });
    }
  });

  setupMouseInputs(scene);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
