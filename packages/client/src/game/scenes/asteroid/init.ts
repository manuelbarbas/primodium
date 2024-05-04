// ASTEROID MAP ENTRY POINT
import { Game } from "engine/types";
import { createAudioApi } from "src/game/api/audio";
import { asteroidSceneConfig } from "../../lib/config/asteroidScene";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";

export const initAsteroidScene = async (game: Game) => {
  const scene = await game.sceneManager.createScene(asteroidSceneConfig, true);
  const audio = createAudioApi(scene);
  audio.initializeAudioVolume();

  scene.phaserScene.lights.enable();
  scene.phaserScene.lights.setAmbientColor(0x808080);

  const mainLight = scene.phaserScene.lights.addLight(
    18 * scene.tiled.tileWidth + scene.tiled.tileWidth / 2,
    -11 * scene.tiled.tileHeight + scene.tiled.tileHeight / 2,
    1700,
    0xe0ffff,
    2
  );

  scene.phaserScene.add.tween({
    targets: mainLight,
    duration: 4000,
    ease: "Sine.easeInOut",
    diameter: 2000,
    intensity: 1,
    repeat: -1,
    yoyo: true,
  });

  // scene.phaserScene.lights
  //   .addPointLight(18 * scene.tiled.tileWidth, -10 * scene.tiled.tileHeight, 0xe0ffff, 2000, 0.2, 0.03)
  //   .setDepth(DepthLayers.Resources + 1);

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene);
};
