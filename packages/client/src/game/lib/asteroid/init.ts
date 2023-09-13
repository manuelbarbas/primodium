// ASTEROID MAP ENTRY POINT
import { EntityID } from "@latticexyz/recs";
import engine from "engine";
import { Network } from "../../../network/setupNetworkOld";
import gameConfig from "../../config/asteroid/game";
import mainSceneConfig from "../../config/asteroid/mainScene";
import { AsteroidMap } from "../../constants";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { setupKeybinds } from "./setup/setupKeybinds";
import { setupMouseInputs } from "./setup/setupMouseInputs";
import { setupTileManager } from "./setup/setupTileManager";
import { runSystems } from "./systems";

export const initAsteroidView = async (player: EntityID, network: Network) => {
  const { Scenes } = AsteroidMap;
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig, true);

  scene.camera.phaserCamera.setRoundPixels(false);

  scene.phaserScene.lights.addLight(18 * 32, -10 * 32, 1000, 0x5a848a, 1.5);
  scene.phaserScene.lights.setAmbientColor(0xb1b1cc);
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
