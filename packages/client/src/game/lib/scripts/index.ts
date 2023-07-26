// PRIMODIUM ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/gameConfig";
import mainSceneConfig from "../../config/mainSceneConfig";
import { Scenes } from "../../constants";
import { runSystems } from "../systems";
import { createChunkManager } from "./managers/chunkManager";
import setupCameraMovement from "./setupCameraMovement";
import setupMouseInputs from "./setupMouseInputs";
import { EntityID } from "@latticexyz/recs";

export const init = async (player: EntityID, network: Network) => {
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  setupMouseInputs(scene, network, player);
  setupCameraMovement(scene, player);

  runSystems(scene);

  world.registerDisposer(() => {
    chunkManager.dispose();
    game.dispose();
  });
};
