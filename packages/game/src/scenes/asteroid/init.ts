// ASTEROID MAP ENTRY POINT
import { Core } from "@primodiumxyz/core";
import type { ContractCalls } from "@client/contractCalls/createContractCalls";

import { createSceneApi } from "@game/api/scene";
import { PrimodiumScene } from "@game/types";
import { asteroidSceneConfig } from "@game/lib/config/asteroidScene";
import { setupBasicCameraMovement } from "@game/scenes/common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "@game/scenes/asteroid/setup/setupKeybinds";
import { setupMouseInputs } from "@game/scenes/asteroid/setup/setupMouseInputs";
import { runSystems as runAsteroidSystems } from "@game/scenes/asteroid/systems";
import { GlobalApi } from "@game/api/global";

export const initAsteroidScene = async (game: GlobalApi, core: Core, calls: ContractCalls): Promise<PrimodiumScene> => {
  const scene = await game.createScene(asteroidSceneConfig, true);

  const sceneApi = createSceneApi(scene);
  sceneApi.audio.setPauseOnBlur(false);

  setupMouseInputs(sceneApi, core);
  setupBasicCameraMovement(sceneApi, core.network.world);
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
  const runSystems = () => runAsteroidSystems(sceneApi, core, calls);

  return { ...sceneApi, runSystems, isPrimary: true };
};
