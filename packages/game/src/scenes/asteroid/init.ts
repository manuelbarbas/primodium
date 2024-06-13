// ASTEROID MAP ENTRY POINT
import { Core } from "@primodiumxyz/core";

import { createSceneApi, PrimodiumScene } from "@/api/scene";
import { asteroidSceneConfig } from "@/lib/config/asteroidScene";
import { setupBasicCameraMovement } from "@/scenes/common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "@/scenes/asteroid/setup/setupKeybinds";
import { setupMouseInputs } from "@/scenes/asteroid/setup/setupMouseInputs";
import { runSystems as runAsteroidSystems } from "@/scenes/asteroid/systems";
import { GlobalApi } from "@/api/global";

export const initAsteroidScene = async (game: GlobalApi, core: Core): Promise<PrimodiumScene> => {
  const scene = await game.createScene(asteroidSceneConfig, true);

  const sceneApi = createSceneApi(scene);

  setupMouseInputs(sceneApi, core);
  setupBasicCameraMovement(sceneApi, core);
  setupKeybinds(sceneApi, core);

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

  scene.camera.phaserCamera.fadeIn(1000);
  const runSystems = () => runAsteroidSystems(sceneApi, core);

  return { ...sceneApi, runSystems, isPrimary: true };
};
