// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/asteroid/game";
import mainSceneConfig from "../../config/asteroid/mainScene";
import { AsteroidMap } from "../../constants";
import { runSystems } from "./systems";
import { setupTileManager } from "./setup/setupTileManager";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { EntityID } from "@latticexyz/recs";
import { setupKeybinds } from "./setup/setupKeybinds";

export const initAsteroidView = async (player: EntityID, network: Network) => {
  const { Scenes } = AsteroidMap;
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  scene.camera.phaserCamera.setRoundPixels(false);

  scene.phaserScene.lights.addLight(18 * 32, -10 * 32, 500, 0x5a848a, 1.5);
  scene.phaserScene.lights.setAmbientColor(0xa2a2ba);
  scene.phaserScene.lights.enable();

  // scene.camera.phaserCamera.postFX.addGradient(
  //   0x0000ff,
  //   undefined,
  //   0.92,
  //   undefined,
  //   undefined,
  //   undefined,
  //   undefined,
  //   50
  // );

  const tileManager = await setupTileManager(scene.tilemap);
  tileManager.renderInitialChunks();
  tileManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene, network, player);
  setupBasicCameraMovement(scene);
  setupKeybinds(scene, player);

  runSystems(scene, player);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
